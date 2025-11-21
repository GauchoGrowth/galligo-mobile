import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { getAmChartsHTML } from './amChartsHtml';

type CountrySelection = { id: string; name: string };

interface AmChartsGlobeProps {
  visitedCountries: string[];
  selectedContinentGeoIds?: string[];
  resetTrigger?: number;
  onCountrySelect?: (country: CountrySelection) => void;
}

export function AmChartsGlobe({
  visitedCountries,
  selectedContinentGeoIds,
  resetTrigger = 0,
  onCountrySelect,
}: AmChartsGlobeProps) {
  const webviewRef = useRef<WebView>(null);
  const [isLoaded, setIsLoaded] = useState(false);

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
});
