import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View, Pressable, Text } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getAmChartsHTML } from './amChartsHtml';

type CountrySelection = { id: string; name: string };

interface AmChartsGlobeProps {
  visitedCountries: string[];
  selectedContinentGeoIds?: string[];
  resetTrigger?: number;
  onCountrySelect?: (country: CountrySelection) => void;
  showReset?: boolean;
  onReset?: () => void;
}

export function AmChartsGlobe({
  visitedCountries,
  selectedContinentGeoIds,
  resetTrigger = 0,
  onCountrySelect,
  showReset = false,
  onReset,
}: AmChartsGlobeProps) {
  const webviewRef = useRef<WebView>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [focused, setFocused] = useState(false);

  const html = useMemo(() => getAmChartsHTML(visitedCountries), [visitedCountries]);
  const reloadKey = useMemo(
    () => visitedCountries.slice().sort().join(',') || 'globe',
    [visitedCountries]
  );

  useEffect(() => {
    setIsLoaded(false);
  }, [html]);

  const sendCommand = (command: unknown) => {
    if (webviewRef.current) {
      webviewRef.current.postMessage(JSON.stringify(command));
    }
  };

  useEffect(() => {
    if (!isLoaded) return;
    if (resetTrigger > 0) {
      sendCommand({ type: 'RESET_GLOBE' });
    }
  }, [resetTrigger, isLoaded]);

  useEffect(() => {
    if (!isLoaded) return;
    if (selectedContinentGeoIds && selectedContinentGeoIds.length > 0) {
      sendCommand({ type: 'ZOOM_CONTINENT', countryCodes: selectedContinentGeoIds });
    }
  }, [selectedContinentGeoIds, isLoaded]);

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data?.type === 'COUNTRY_SELECTED') {
        setFocused(true);
        onCountrySelect?.({ id: data.id, name: data.name });
      }
    } catch {
      // no-op for malformed messages
    }
  };

  return (
    <View style={styles.container}>
      {!isLoaded && (
        <View style={styles.loader}>
          <ActivityIndicator size="large" color="#00DDFF" />
        </View>
      )}
      {showReset && focused && (
        <View style={styles.resetContainer}>
          <Pressable
            onPress={() => {
              setFocused(false);
              if (onReset) onReset();
            }}
            style={({ pressed }) => [
              styles.resetButton,
              pressed && { opacity: 0.8 },
            ]}
            accessibilityLabel="Return to globe"
          >
            <Text style={styles.resetText}>Return to globe</Text>
          </Pressable>
        </View>
      )}
      <WebView
        ref={webviewRef}
        key={reloadKey}
        originWhitelist={['*']}
        source={{ html }}
        onLoadEnd={() => setIsLoaded(true)}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        allowsInlineMediaPlayback
        style={styles.webview}
        scrollEnabled={false}
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  resetContainer: {
    position: 'absolute',
    top: 12,
    right: 12,
    zIndex: 20,
  },
  resetButton: {
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.08)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
  },
  resetText: {
    fontSize: 13,
    color: '#0F172A',
    fontFamily: 'OutfitMedium',
  },
});
