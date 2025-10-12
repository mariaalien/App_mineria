import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Logo de TuMina recreado con formas CSS
const TuMinaLogo = ({ size = 90, showText = true, animated = false }) => {
  const pinSize = size;
  const circleSize = size * 0.6;
  const cartSize = size * 0.25;

  return (
    <View style={[styles.logoContainer, { width: size * 1.2, height: showText ? size * 1.8 : size * 1.2 }]}>
      {/* Pin de ubicación verde */}
      <View style={[styles.pin, { width: pinSize, height: pinSize * 1.2 }]}>
        {/* Cabeza del pin */}
        <View style={[styles.pinHead, { 
          width: circleSize, 
          height: circleSize, 
          borderRadius: circleSize / 2 
        }]}>
          {/* Círculo interior blanco */}
          <View style={[styles.pinInner, { 
            width: circleSize * 0.75, 
            height: circleSize * 0.75, 
            borderRadius: (circleSize * 0.75) / 2 
          }]}>
            {/* Vagón minero */}
            <View style={styles.cartContainer}>
              {/* Montañas/carbón en el vagón */}
              <View style={styles.mountains}>
                <View style={[styles.mountain1, { width: cartSize * 0.4, height: cartSize * 0.3 }]} />
                <View style={[styles.mountain2, { width: cartSize * 0.35, height: cartSize * 0.25 }]} />
                <View style={[styles.mountain3, { width: cartSize * 0.3, height: cartSize * 0.2 }]} />
              </View>
              
              {/* Base del vagón */}
              <View style={[styles.cartBase, { 
                width: cartSize, 
                height: cartSize * 0.4,
                borderRadius: cartSize * 0.05
              }]} />
              
              {/* Ruedas del vagón */}
              <View style={styles.wheels}>
                <View style={[styles.wheel, { 
                  width: cartSize * 0.25, 
                  height: cartSize * 0.25, 
                  borderRadius: (cartSize * 0.25) / 2,
                  left: cartSize * 0.15
                }]} />
                <View style={[styles.wheel, { 
                  width: cartSize * 0.25, 
                  height: cartSize * 0.25, 
                  borderRadius: (cartSize * 0.25) / 2,
                  right: cartSize * 0.15
                }]} />
              </View>
            </View>
          </View>
        </View>
        
        {/* Punta del pin */}
        <View style={[styles.pinPoint, { 
          width: pinSize * 0.15, 
          height: pinSize * 0.25,
          marginTop: -pinSize * 0.08
        }]} />
      </View>
      
      {/* Texto TuMina */}
      {showText && (
        <View style={styles.textContainer}>
          <Text style={[styles.tuText, { fontSize: size * 0.35 }]}>Tu</Text>
          <Text style={[styles.minaText, { fontSize: size * 0.35 }]}>Mina</Text>
          
          {/* Línea decorativa multicolor */}
          <View style={[styles.decorativeLine, { width: size * 0.8, height: size * 0.08 }]}>
            <View style={[styles.lineYellow, { width: '25%', height: '100%' }]} />
            <View style={[styles.lineBlue, { width: '25%', height: '100%' }]} />
            <View style={[styles.lineRed, { width: '25%', height: '100%' }]} />
            <View style={[styles.lineGreen, { width: '25%', height: '100%' }]} />
          </View>
        </View>
      )}
    </View>
  );
};

// Versión mini del logo (solo pin)
const TuMinaMiniLogo = ({ size = 40 }) => {
  return <TuMinaLogo size={size} showText={false} />;
};

// Versión para header/navegación
const TuMinaHeaderLogo = ({ size = 60 }) => {
  return (
    <View style={styles.headerContainer}>
      <TuMinaLogo size={size} showText={false} />
      <Text style={[styles.headerText, { fontSize: size * 0.2 }]}>TuMina</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  
  // Pin de ubicación
  pin: {
    alignItems: 'center',
    shadowColor: '#2E7D32',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  pinHead: {
    backgroundColor: '#4CAF50', // Verde del logo
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#2E7D32',
  },
  pinInner: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  pinPoint: {
    backgroundColor: '#4CAF50',
    transform: [{ rotate: '45deg' }],
  },
  
  // Vagón minero
  cartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  mountains: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 1,
  },
  mountain1: {
    backgroundColor: '#424242',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginRight: -2,
  },
  mountain2: {
    backgroundColor: '#616161',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    marginRight: -2,
  },
  mountain3: {
    backgroundColor: '#424242',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
  },
  cartBase: {
    backgroundColor: '#424242',
    borderWidth: 1,
    borderColor: '#212121',
  },
  wheels: {
    flexDirection: 'row',
    position: 'absolute',
    bottom: -4,
    width: '100%',
  },
  wheel: {
    backgroundColor: '#212121',
    borderWidth: 1,
    borderColor: '#424242',
    position: 'absolute',
  },
  
  // Texto TuMina
  textContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  tuText: {
    color: '#4CAF50', // Verde
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: -4,
  },
  minaText: {
    color: '#2196F3', // Azul
    fontWeight: 'bold',
    fontFamily: 'System',
    marginBottom: 4,
  },
  
  // Línea decorativa
  decorativeLine: {
    flexDirection: 'row',
    borderRadius: 4,
    overflow: 'hidden',
  },
  lineYellow: {
    backgroundColor: '#FFC107',
  },
  lineBlue: {
    backgroundColor: '#2196F3',
  },
  lineRed: {
    backgroundColor: '#F44336',
  },
  lineGreen: {
    backgroundColor: '#4CAF50',
  },
  
  // Header version
  headerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerText: {
    marginLeft: 8,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
});

export { TuMinaLogo, TuMinaMiniLogo, TuMinaHeaderLogo };
export default TuMinaLogo;