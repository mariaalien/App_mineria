# 📱 CONFIGURAR EL ÍCONO DE TU APP - GUÍA SIMPLE

## 🎯 ¿QUÉ VAMOS A HACER?

Cambiar el ícono que aparece en el menú del celular cuando instalas la app.

---

## 📸 DIFERENCIA VISUAL

### ANTES (Con Expo Go):
```
📱 Pantalla del celular:
┌─────────────────┐
│  [Expo Icon]    │  ← Ícono morado/naranja de Expo
│   Expo Go       │
└─────────────────┘
```

### DESPUÉS (Con tu logo):
```
📱 Pantalla del celular:
┌─────────────────┐
│  [TU LOGO]      │  ← TU logo de ANM
│  ANM FRI        │
└─────────────────┘
```

---

## 🔧 PASOS SÚPER SIMPLES

### 📍 PASO 1: SUBIR TU LOGO AQUÍ

1. **Sube tu archivo `logo.png`** en el chat
2. Debe ser:
   - Cuadrado (1024x1024 píxeles idealmente)
   - Formato PNG
   - Fondo transparente o de color

---

### 📍 PASO 2: YO LO CONFIGURO

Una vez subas el logo, yo voy a:

1. ✅ Copiarlo a las carpetas correctas
2. ✅ Renombrarlo a `icon.png` y `adaptive-icon.png`
3. ✅ Crear el `splash.png` (pantalla de carga)
4. ✅ Actualizar el `app.json`

---

### 📍 PASO 3: REINICIAR LA APP

```bash
npx expo start --clear
```

Escaneas el QR y listo!

---

## ⚠️ IMPORTANTE: DOS MODOS

### 🟡 MODO DESARROLLO (Expo Go)
**Lo que verás:**
- ✅ Splash Screen con TU logo
- ❌ Ícono del menú: sigue siendo Expo (normal)

**Por qué:** Expo Go es una app "contenedor" que muestra tu app dentro.

---

### 🟢 MODO PRODUCCIÓN (Build/APK)
**Lo que verás:**
- ✅ Splash Screen con TU logo
- ✅ Ícono del menú: TU logo

**Cómo hacerlo:**
```bash
# Instalar EAS CLI (solo una vez)
npm install -g eas-cli

# Login en Expo
eas login

# Crear build para Android
eas build -p android --profile preview
```

Esto genera un archivo APK que instalas en tu celular y ahí SÍ verás tu ícono real.

---

## 📁 ESTRUCTURA DE ARCHIVOS

```
tu-proyecto/
├── assets/
│   ├── icon.png            ← Ícono (1024x1024)
│   ├── adaptive-icon.png   ← Android (1024x1024)
│   ├── splash.png          ← Pantalla carga
│   └── images/
│       └── logo.png        ← Tu logo original
└── app.json               ← Configuración
```

---

## 💡 TAMAÑOS RECOMENDADOS

| Archivo | Tamaño | Uso |
|---------|--------|-----|
| `icon.png` | 1024x1024 | Ícono principal |
| `adaptive-icon.png` | 1024x1024 | Android adaptable |
| `splash.png` | 1284x2778 | Pantalla de carga |

---

## 🚀 ACCIÓN INMEDIATA

**¿Qué necesito de ti ahora?**

1. **Sube tu archivo logo.png aquí en el chat**
   - Haz clic en el botón de adjuntar archivo (📎)
   - Selecciona tu logo
   - Súbelo

2. **Yo lo configuro todo automáticamente**

3. **Reiniciamos la app y listo!**

---

## ❓ PREGUNTAS FRECUENTES

**P: ¿Mi logo debe ser cuadrado?**
R: Idealmente sí, pero si es rectangular lo podemos centrar en un cuadrado.

**P: ¿Qué pasa si mi logo es muy pequeño?**
R: Lo podemos redimensionar, pero mejor si es grande (mínimo 512x512).

**P: ¿Por qué no veo mi ícono en el menú con Expo Go?**
R: Es normal. Expo Go muestra su propio ícono. Para ver el tuyo, necesitas hacer un "build".

**P: ¿Cuánto tarda hacer un build?**
R: Entre 5-15 minutos aproximadamente.

---

## ✅ CHECKLIST

- [ ] Subir logo.png (1024x1024)
- [ ] Verificar que se copió correctamente
- [ ] Reiniciar servidor con `npx expo start --clear`
- [ ] Ver Splash Screen con mi logo
- [ ] (Opcional) Hacer build para ver ícono en menú

---

**¡LISTO! Ahora sube tu logo y continuamos!** 📤

