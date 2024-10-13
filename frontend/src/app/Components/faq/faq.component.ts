import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.css']
})
export class FaqComponent implements OnInit {
  
  // FAQ data
  faqData = [
    { question: "What is your return policy?", answer: "You can return any item within 30 days of purchase.", key: 1 },
    { question: "How do I track my order?", answer: "You can track your order by logging into your account and selecting 'Track Order'.", key: 2 },
    { question: "Do you ship internationally?", answer: "Yes, we ship to over 100 countries worldwide.", key: 3 },
    { question: "How can I contact customer support?", answer: "You can reach our customer support team via email at support@example.com.", key: 4 },
    { question: "What payment methods do you accept?", answer: "We accept Visa, MasterCard, American Express, and PayPal.", key: 5 },
    { question: "Can I change or cancel my order?", answer: "Orders can be changed or canceled within 24 hours of placing them.", key: 6 },
    { question: "What is the warranty on your products?", answer: "All products come with a one-year warranty.", key: 7 },
    { question: "Do you offer gift cards?", answer: "Yes, we offer both physical and digital gift cards.", key: 8 },
    { question: "How can I apply a discount code?", answer: "You can apply a discount code during the checkout process.", key: 9 },
    { question: "How do I reset my password?", answer: "Click on 'Forgot Password' at the login page and follow the instructions.", key: 10 }
  ];

  // To track the active question index
  activeIndex: number = -1;

  constructor() { }

  ngOnInit(): void {
    // You can initialize anything you need here when the component loads
  }

  // Toggle the display of answer based on the question key
  toggleAnswer(key: number): void {
    this.activeIndex = this.activeIndex === key ? -1 : key;
  }
}
