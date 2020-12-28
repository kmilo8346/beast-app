import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../components/text';
import LoadingOverlay, {
  ILoadingOverlay,
} from '../../../../components/loading-overlay';
import Switch from '../../../../components/switch';
// clients
import storeClient from '../../../../clients/store-client';
// cache
import storeCache from '../../../../cache/store';
// libs
import { capture } from '../../../../lib/sentry';
// styles
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[visibility input component]';

interface ComponentProps {
  id: string;
  enabled: boolean;
}

export default ({ id, enabled }: ComponentProps) => {
  // state
  const [state, setState] = useState(enabled);
  const loadingOverlayRef = useRef<ILoadingOverlay>(null);

  // event handlers
  const valueChangeHandler = async (enabled: boolean) => {
    try {
      // optimistic update
      setState(enabled);

      await loadingOverlayRef.current?.show();
      const storeUpdated = await storeClient.update({
        pathVars: {
          id,
        },
        body: {
          enabled,
        },
      });
      storeCache.updateData(storeUpdated);
    } catch (error) {
      capture(prefix, 'Value change handler error', error);
      setState(!enabled);
    } finally {
      await loadingOverlayRef.current?.hide();
    }
  };

  useEffect(() => {
    setState(enabled);
  }, [enabled]);

  // render logic
  let text = 'Visible';
  if (!enabled) {
    text = 'No visible';
  }
  return (
    <View style={{ marginBottom: 20 }}>
      <Text level={6}>Visibilidad</Text>
      <View
        style={{
          borderColor: colors.blackLight8,
          borderBottomWidth: 1,
          paddingVertical: 10,
          minHeight: 48,
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <Text
          level={6}
          style={{ flex: 1, marginRight: 5, color: colors.blackLight4 }}
        >
          {text}
        </Text>
        <Switch defaultValue value={state} onValueChange={valueChangeHandler} />
      </View>
      <LoadingOverlay ref={loadingOverlayRef} />
    </View>
  );
};
