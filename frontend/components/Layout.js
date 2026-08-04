import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { View, StyleSheet, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Theme } from '../theme';

const Layout = ({
  children,
  scrollable = true,
  padding = true,
  backgroundColor,
  backgroundGradient,
  header,
  footer,
  refreshControl,
  darkMode = false,
}) => {
  const bgColor = darkMode ? Theme.colors.darkBg : (backgroundColor || Theme.colors.background);
  const gradColors = backgroundGradient || (darkMode
    ? Theme.gradients.heroDark
    : Theme.gradients.background);

  const renderContent = () => {
    const Container = scrollable ? ScrollView : View;
    const containerProps = scrollable
      ? {
          contentContainerStyle: [styles.scrollContent, padding && styles.padding],
          showsVerticalScrollIndicator: false,
          refreshControl,
        }
      : {};

    return (
      <Container style={[styles.container]} {...containerProps}>
        {!scrollable && padding ? (
          <View style={[styles.flex, styles.padding]}>{children}</View>
        ) : children}
      </Container>
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: bgColor }]}>
      <StatusBar
        barStyle={darkMode ? 'light-content' : 'dark-content'}
        backgroundColor="transparent"
        translucent
      />
      <LinearGradient
        colors={gradColors}
        style={styles.gradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      >
        {header}
        {renderContent()}
        {footer}
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  gradient: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
  },
  flex: {
    flex: 1,
  },
  padding: {
    padding: Theme.spacing.lg,
  },
});

export default Layout;
