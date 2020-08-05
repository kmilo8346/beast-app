// libs
import firebase from '../lib/firebase';
// types
import { User, Place } from '../types';

const prefix = '[user client]';
const db = firebase.firestore();
const auth = firebase.auth();

class UserClient {
  async signIn(
    credential: firebase.auth.AuthCredential,
    prevUser: User,
    version: number
  ) {
    const result = await auth.signInWithCredential(credential);
    if (!result.user) {
      throw new Error(`${prefix} User must be defined after a success signin`);
    }
    let firstName = result.user?.displayName;
    let lastName = '';
    if (result.additionalUserInfo?.profile) {
      const profile: any = result.additionalUserInfo.profile;

      if (profile.first_name) {
        firstName = profile.first_name;
      } else if (profile.given_name) {
        firstName = profile.given_name;
      }

      if (profile.last_name) {
        lastName = profile.last_name;
      } else if (profile.family_name) {
        lastName = profile.family_name;
      }
    }

    const ref = db.collection('users').doc(result.user.uid);
    await db.runTransaction(async (transaction) => {
      const doc = await transaction.get(ref);
      if (!doc.exists) {
        await transaction.set(ref, {
          id: result.user?.uid,
          email: result.user?.email,
          firstName,
          lastName,
          photoUrl: result.user?.photoURL,
          phone: result.user?.phoneNumber,
          phoneVerified: false,
          currentAddress: prevUser.currentAddress || null,
          addresses: prevUser.addresses || [],
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        });
      }
      if ((prevUser.addresses || []).length) {
        const user: User = doc.data() as User;
        const addressIds = (prevUser.addresses || []).map(
          (address: Place) => address.id
        );
        const addresses = Array.prototype.concat(
          prevUser.addresses || [],
          (user.addresses || []).filter(
            (address: Place) => addressIds.indexOf(address.id) === -1
          )
        );
        const currentAddress = prevUser.currentAddress || user.currentAddress;
        await transaction.update(ref, { currentAddress, addresses });
      }

      // mark with version to identify transaction
      await transaction.update(ref, { version });
    });
  }

  async signOut() {
    return auth.signOut();
  }

  async get(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) {
      return undefined;
    }
    return doc.data() as User;
  }

  async create(user: firebase.User) {
    if (!user) {
      throw new Error(`${prefix} User credential dont have a valid user`);
    }
    await db.collection('users').doc(user.uid).set({
      id: user.uid,
      email: user.email,
      firstName: user.displayName,
      photoUrl: user.photoURL,
      phone: user.phoneNumber,
      phoneVerified: false,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  async update(id: string, data: Partial<User>, version: number) {
    const update: any = {
      ...data,
      version,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('users').doc(id).update(update);
  }

  async delete(id: string) {
    await db.collection('users').doc(id).delete();
  }
}

export default new UserClient();
