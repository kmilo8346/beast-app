import React, { useState } from 'react';
import { View } from 'react-native';

// components
import Text from '../../../../components/text';
import Modal from '../../../../components/modals/modal';
// libs
import { normalizeOpeningHours } from '../../../../lib/utils';
import stringFormatter from '../../../../lib/formatters/string-formatter';
import numberFormatter from '../../../../lib/formatters/number-formatter';
// types
import { OpeningHours } from '../../../../types';
// styles
import globalStyles from '../../../../styles';
import colors from '../../../../styles/colors';

// instances outside component
const prefix = '[view opening hours modal]';
const sortOpeningHours = (openingHours: OpeningHours) => {
  const date = new Date();
  let day = `${date.getDay()}`;
  if (day === '0') {
    day = '7';
  }
  const index = openingHours.findIndex((i) => i.day === day);
  if (index === -1) {
    throw new Error(`${prefix} Today day dont found in opening hours`);
  }
  const oh = normalizeOpeningHours(openingHours);
  const result: OpeningHours = [];
  let i = index;
  let cont = 0;
  const total = oh.length;
  do {
    result.push(oh[i]);
    cont++;
    i++;
    if (i === total) {
      i = 0;
    }
  } while (cont < total);
  return result;
};

interface ComponentProps {
  openingHours: OpeningHours;
  onClose: () => void;
}

export default ({ openingHours, onClose }: ComponentProps) => {
  const [oh] = useState<OpeningHours>(sortOpeningHours(openingHours));

  // event handlers
  const requestCloseHandler = () => {
    onClose();
  };

  // render logic
  console.log(oh.length);
  return (
    <Modal onRequestClose={requestCloseHandler} title="Horario de atención">
      <View style={globalStyles.modalSubtitleSpace} />
      <View style={{ marginHorizontal: 30 }}>
        {oh.map((dayOpeningHours, index) => (
          <View
            key={`${dayOpeningHours.day}-${index}`}
            style={{ flexDirection: 'row', marginBottom: 10 }}
          >
            <Text
              level={5}
              numberOfLines={1}
              ellipsizeMode="tail"
              style={{
                flex: 1,
              }}
            >
              {stringFormatter.toWeekDay(dayOpeningHours.day, {
                capitalize: true,
              })}
            </Text>
            <View style={{ flex: 2 }}>
              {(dayOpeningHours.hours || []).map((hours, index) => (
                <Text
                  level={5}
                  key={`${index}`}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  color={colors.blackLight2}
                  style={{
                    marginBottom: 3,
                  }}
                >{`${numberFormatter.humanizeTime(
                  hours.open
                )} a ${numberFormatter.humanizeTime(hours.close)}`}</Text>
              ))}
              {!(dayOpeningHours.hours || []).length && (
                <Text
                  level={5}
                  numberOfLines={1}
                  ellipsizeMode="tail"
                  color={colors.blackLight2}
                  style={{
                    marginBottom: 3,
                  }}
                >
                  Cerrado
                </Text>
              )}
            </View>
          </View>
        ))}
      </View>
    </Modal>
  );
};
