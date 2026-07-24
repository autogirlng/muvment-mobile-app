import React from 'react';
import { View, Text } from 'react-native';

import { useAppTheme } from '../../theme/useAppTheme';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  bgColorClass: string;
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColorClass }) => {
  const theme = useAppTheme();

  return (
    <View 
      className={`flex-1 rounded-2xl p-4 flex-row justify-between items-start shadow-sm border border-dashboard-cardBorder ${bgColorClass}`}
      style={theme.styles.card}
    >
      <View>
        <Text
          className="text-3xl font-inter font-bold text-brand-primary mb-1"
          style={theme.styles.primaryText}
        >
          {value}
        </Text>
        <Text
          className="text-xs font-inter text-brand-secondary font-medium"
          style={theme.styles.mutedText}
        >
          {title}
        </Text>
      </View>
      
      <View
        className="w-10 h-10 rounded-full border border-dashboard-cardBorder items-center justify-center bg-transparent"
        style={theme.styles.border}
      >
        {icon}
      </View>
    </View>
  );
};
