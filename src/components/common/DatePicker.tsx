import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, GestureResponderEvent } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface DatePickerModalProps {
  visible: boolean;
  onClose: () => void;
  onSelectDate?: (date: Date) => void; // Now returns a real Date object
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({ 
  visible, 
  onClose,
  onSelectDate 
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [pickerMode, setPickerMode] = useState<'calendar' | 'month' | 'year'>('calendar');
  const [yearPageStart, setYearPageStart] = useState(() => {
    const year = new Date().getFullYear();
    return year - (year % 12);
  });

  const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const months = Array.from({ length: 12 }, (_, month) =>
    new Intl.DateTimeFormat('en-US', { month: 'short' }).format(new Date(2026, month, 1))
  );
  const years = Array.from({ length: 12 }, (_, index) => yearPageStart + index);

  const calendarGrid = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const startDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const grid = [];

    for (let i = 0; i < startDay; i++) {
      grid.push({
        day: daysInPrevMonth - startDay + i + 1,
        isCurrentMonth: false,
        fullDate: new Date(year, month - 1, daysInPrevMonth - startDay + i + 1)
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      grid.push({
        day: i,
        isCurrentMonth: true,
        fullDate: new Date(year, month, i)
      });
    }

    const remainingCells = 42 - grid.length;
    for (let i = 1; i <= remainingCells; i++) {
      grid.push({
        day: i,
        isCurrentMonth: false,
        fullDate: new Date(year, month + 1, i)
      });
    }

    return grid;
  }, [currentMonth]);

  const handlePrevMonth = () => {
    if (pickerMode === 'year') {
      setYearPageStart((prev) => prev - 12);
      return;
    }

    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    if (pickerMode === 'year') {
      setYearPageStart((prev) => prev + 12);
      return;
    }

    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    if (onSelectDate) onSelectDate(date);
    setTimeout(onClose, 300);
  };

  const stopOverlayClose = (event: GestureResponderEvent) => {
    event.stopPropagation();
  };

  const handleHeaderPress = () => {
    setPickerMode((mode) => {
      if (mode === 'calendar') return 'month';
      if (mode === 'month') {
        setYearPageStart(currentMonth.getFullYear() - (currentMonth.getFullYear() % 12));
        return 'year';
      }
      return 'calendar';
    });
  };

  const handleMonthSelect = (month: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), month, 1));
    setPickerMode('calendar');
  };

  const handleYearSelect = (year: number) => {
    setCurrentMonth(new Date(year, currentMonth.getMonth(), 1));
    setPickerMode('month');
  };

  const headerTitle = new Intl.DateTimeFormat('en-US', {
    month: 'long',
    year: 'numeric'
  }).format(currentMonth);
  const displayedTitle =
    pickerMode === 'calendar'
      ? headerTitle
      : pickerMode === 'month'
        ? String(currentMonth.getFullYear())
        : `${yearPageStart} - ${yearPageStart + 11}`;

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable className="flex-1 bg-black/40 justify-center items-center px-4" onPress={onClose}>
        <Pressable className="bg-white w-full max-w-sm rounded-3xl p-5 shadow-xl" onPress={stopOverlayClose}>
          <View className="flex-row justify-between items-center mb-6 px-2">
            <TouchableOpacity className="flex-row items-center flex-1 pr-3" onPress={handleHeaderPress}>
              <Text className="text-xl font-inter font-bold text-[#101928] mr-2">
                {displayedTitle}
              </Text>
              <Feather name="chevron-down" size={20} color="#0088FF" />
            </TouchableOpacity>

            <View className="flex-row items-center space-x-6">
              <TouchableOpacity onPress={handlePrevMonth}>
                <Feather name="chevron-left" size={24} color="#0088FF" />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleNextMonth}>
                <Feather name="chevron-right" size={24} color="#0088FF" />
              </TouchableOpacity>
            </View>
          </View>

          {pickerMode === 'calendar' ? (
            <>
              <View className="flex-row justify-between mb-4 px-2">
                {daysOfWeek.map((day, idx) => (
                  <Text key={idx} className="w-9 text-center font-inter font-bold text-[#101928]">
                    {day}
                  </Text>
                ))}
              </View>

              <View className="flex-row flex-wrap justify-between">
                {calendarGrid.map((item, index) => {
                  const isSelected = selectedDate?.toDateString() === item.fullDate.toDateString();

                  return (
                    <TouchableOpacity 
                      key={index}
                      disabled={!item.isCurrentMonth}
                      onPress={() => handleDateSelect(item.fullDate)}
                      className={`w-10 h-10 mb-2 items-center justify-center rounded-full ${
                        isSelected ? 'bg-[#0088FF]' : 'border border-[#F2F4F7]'
                      }`}
                    >
                      <Text 
                        className={`font-inter text-base ${
                          isSelected 
                            ? 'text-white font-semibold' 
                            : item.isCurrentMonth 
                              ? 'text-[#101928]' 
                              : 'text-[#D0D5DD]'
                        }`}
                      >
                        {item.day}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </>
          ) : (
            <View className="flex-row flex-wrap justify-between">
              {(pickerMode === 'month' ? months : years).map((item, index) => {
                const isActive =
                  pickerMode === 'month'
                    ? currentMonth.getMonth() === index
                    : currentMonth.getFullYear() === item;

                return (
                  <TouchableOpacity
                    key={item}
                    onPress={() => {
                      if (pickerMode === 'month') {
                        handleMonthSelect(index);
                      } else {
                        handleYearSelect(Number(item));
                      }
                    }}
                    className={`w-[30%] h-12 mb-3 rounded-xl items-center justify-center ${
                      isActive ? 'bg-[#0088FF]' : 'border border-[#E4E7EC] bg-white'
                    }`}
                  >
                    <Text className={`font-inter font-semibold ${isActive ? 'text-white' : 'text-[#101928]'}`}>
                      {item}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
};
