import { StyleSheet, Text, View } from 'react-native';
import { DishCarousel } from '../ui/dish-carousel';
import { dishCarouselItems } from './dish-carousel-data';

const images: Readonly<Record<string, number>> = {
  'gourmet-laddoo-box': require('./assets/dish-carousel/gourmet-laddoo-box.png'),
  'guava-chilli-fizz': require('./assets/dish-carousel/guava-chilli-fizz.png'),
  'gulab-jamun-donut': require('./assets/dish-carousel/gulab-jamun-donut.png'),
  'gulab-jamun-donut-box': require('./assets/dish-carousel/gulab-jamun-donut-box.png'),
  'motichoor-cheesecake': require('./assets/dish-carousel/motichoor-cheesecake.png'),
  'mexican-mango-chilli': require('./assets/dish-carousel/mexican-mango-chilli.png'),
  'virgin-jamun-mojito': require('./assets/dish-carousel/virgin-jamun-mojito.png'),
  'virgin-picante-pop': require('./assets/dish-carousel/virgin-picante-pop.png'),
};
const data = dishCarouselItems.map((item) => ({ ...item, image: images[item.id] ?? 0 }));

/** Load the optional Okra and Retro fonts in the host (the recorder does this). */
export default function DishCarouselDemo() {
  return (
    <View style={styles.screen}>
      <View style={styles.top}>
        <Text style={styles.eyebrow}>FRESH FROM THE KITCHEN</Text>
        <Text style={styles.title}>A little reveal. A lot to love.</Text>
      </View>
      <DishCarousel
        data={data}
        fontFamily="BistroOkra"
        priceFontFamily="BistroRetro"
        style={styles.carousel}
        testID="dish-carousel"
      />
      <Text style={styles.footer}>SWIPE TO DISCOVER YOUR NEXT FAVOURITE</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { backgroundColor: '#ffffff', paddingVertical: 32 },
  top: { alignItems: 'center', paddingHorizontal: 20, paddingBottom: 18 },
  eyebrow: { fontSize: 9, letterSpacing: 2, color: '#007547', fontWeight: '700' },
  title: { fontSize: 17, fontWeight: '600', color: '#003e2b', marginTop: 9 },
  carousel: { backgroundColor: '#ffffff' },
  footer: { marginTop: 32, textAlign: 'center', fontSize: 9, letterSpacing: 1.5, color: '#8a9491' },
});
