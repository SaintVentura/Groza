import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

const faqs = [
  {
    id: '1',
    question: 'How do I place an order?',
    answer: 'Browse vendors on the Home or Explore page, select items from their menu, add them to your cart, and proceed to checkout. You can pay with cash on delivery.',
  },
  {
    id: '2',
    question: 'What payment methods do you accept?',
    answer: 'We currently accept cash on delivery. You can add payment methods in your profile settings.',
  },
  {
    id: '3',
    question: 'How long does delivery take?',
    answer: 'Delivery times vary by vendor and location, typically ranging from 10-30 minutes. You can see estimated delivery times on each vendor\'s page.',
  },
  {
    id: '4',
    question: 'Can I track my order?',
    answer: 'Yes! Once you place an order, you can track its status in real-time from the Orders page in your profile.',
  },
  {
    id: '5',
    question: 'What if I need to cancel my order?',
    answer: 'You can cancel your order from the Orders page if it hasn\'t been confirmed yet. Contact support if you need assistance.',
  },
  {
    id: '6',
    question: 'How do I add a delivery address?',
    answer: 'Go to your Profile, then select "Delivery Addresses" to add, edit, or remove addresses.',
  },
  {
    id: '7',
    question: 'Are there delivery fees?',
    answer: 'Delivery fees vary by vendor and are displayed on each vendor\'s page before you place an order.',
  },
  {
    id: '8',
    question: 'How do I contact support?',
    answer: 'You can reach us via WhatsApp at +27 65 671 3102, email at grozadelivery@gmail.com, or use the Help & Support page in your profile.',
  },
];

export default function FAQsScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { scrollViewRef, handleScroll } = useScrollPreservation('faqs');

  useFocusEffect(
    React.useCallback(() => {
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      translateY.setValue(24);
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, [slideAnim, fadeAnim, translateY])
  );

  const handleBackPress = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.back();
    });
  };

  const toggleFAQ = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View
        style={[
          { flex: 1 },
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>FAQs</Text>
        </View>

        <ScrollView
          ref={scrollViewRef as any}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.content}>
            {faqs.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => toggleFAQ(faq.id)}
                activeOpacity={0.7}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedId === faq.id ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color="#666"
                  />
                </View>
                {expandedId === faq.id && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    flex: 1,
    marginRight: 12,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666',
    marginTop: 12,
    lineHeight: 20,
  },
});




