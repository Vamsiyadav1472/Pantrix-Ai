import { useTranslation } from "react-i18next";
import React from 'react';
import { Theme } from '../theme';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
const CalendarViewScreen = () => {
  const {
    t
  } = useTranslation();
  const weeks = [[26, 27, 28, 29, 30, 1, 2], [3, 4, 5, 6, 7, 8, 9], [10, 11, 12, 13, 14, 15, 16], [17, 18, 19, 20, 21, 22, 23]];
  return <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("CalendarViewScreen.May_2026")}</Text>
      </View>
      
      <View style={styles.calendar}>
        <View style={styles.daysHeader}>
          {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map(d => <Text key={d} style={styles.dayLabel}>{d}</Text>)}
        </View>

        {weeks.map((week, i) => <View key={i} style={styles.weekRow}>
            {week.map((day, j) => <TouchableOpacity key={j} style={[styles.dayCell, day === 5 && styles.today]}>
                <Text style={[styles.dayText, day === 5 && styles.todayText]}>{day}</Text>
                {day === 5 && <View style={styles.dot} />}
              </TouchableOpacity>)}
          </View>)}
      </View>

      <View style={styles.agenda}>
        <Text style={styles.agendaTitle}>{t("CalendarViewScreen.Today_s_Agenda")}</Text>
        <View style={styles.agendaItem}>
          <Text style={styles.time}>08:00</Text>
          <View style={styles.event}>
            <Text style={styles.eventTitle}>{t("CalendarViewScreen.Breakfast_Oatmeal")}</Text>
          </View>
        </View>
        <View style={styles.agendaItem}>
          <Text style={styles.time}>13:00</Text>
          <View style={styles.event}>
            <Text style={styles.eventTitle}>{t("CalendarViewScreen.Lunch_Quinoa_Salad")}</Text>
          </View>
        </View>
      </View>
    </SafeAreaView>;
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Theme.colors.card
  },
  header: {
    padding: 24,
    alignItems: 'center'
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Theme.colors.text
  },
  calendar: {
    padding: 20,
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 24
  },
  daysHeader: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20
  },
  dayLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: 'bold'
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15
  },
  dayCell: {
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10
  },
  today: {
    backgroundColor: '#059669'
  },
  dayText: {
    fontSize: 14,
    color: '#374151'
  },
  todayText: {
    color: Theme.colors.card,
    fontWeight: 'bold'
  },
  dot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Theme.colors.card,
    marginTop: 2
  },
  agenda: {
    padding: 24
  },
  agendaTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginBottom: 20
  },
  agendaItem: {
    flexDirection: 'row',
    marginBottom: 16
  },
  time: {
    width: 50,
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600'
  },
  event: {
    flex: 1,
    backgroundColor: '#ECFDF5',
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669'
  },
  eventTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#065F46'
  }
});
export default CalendarViewScreen;