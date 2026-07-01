import React from 'react';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CustomButton } from './CustomButton';

type ChecklistFooterProps = React.ComponentProps<typeof CustomButton>;

export const ChecklistFooter: React.FC<ChecklistFooterProps> = (props) => {
  const insets = useSafeAreaInsets();

  return (
    <View
      className="px-5 pt-4 bg-[#F8FAFC]"
      style={{ flexShrink: 0, paddingBottom: Math.max(insets.bottom, 24) }}
    >
      <CustomButton {...props} />
    </View>
  );
};
