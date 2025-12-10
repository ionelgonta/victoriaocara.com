'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface LanguageContextType {
  language: 'en' | 'ro';
  setLanguage: (lang: 'en' | 'ro') => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.gallery': 'Gallery',
    'nav.customPainting': 'Order Painting',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.cart': 'Cart',
    'nav.language': 'Language',
    
    // Homepage
    'home.hero.title': 'Original Art',
    'home.hero.subtitle': 'Discover unique oil paintings inspired by nature and emotion',
    'home.hero.cta': 'Explore Gallery',
    'home.hero.contact': 'Contact Artist',
    'home.featured.title': 'Featured Works',
    'home.featured.viewAll': 'View All Paintings',
    'home.featured.noFeatured': 'No featured paintings available at the moment.',
    'home.featured.addFromAdmin': 'To display paintings here, add paintings in the admin panel and check "Featured on Homepage".',
    'home.about.title': 'About the Artist',
    
    // Gallery
    'gallery.title': 'Gallery',
    'gallery.subtitle': 'Explore our complete collection of original paintings',
    'gallery.showSold': 'Show sold paintings',
    'gallery.loading': 'Loading paintings...',
    'gallery.error': 'Error loading paintings',
    'gallery.tryAgain': 'Try again',
    'gallery.noPaintings': 'No paintings available at the moment.',
    'gallery.addFromAdmin': 'Add paintings from the admin panel to see them here.',
    
    // Painting Card
    'painting.available': 'Available',
    'painting.sold': 'Sold',
    
    // Individual Painting
    'painting.dimensions': 'Dimensions',
    'painting.technique': 'Technique',
    'painting.available.status': 'Available',
    'painting.sold.status': 'Sold',
    'painting.outOfStock': 'Out of Stock',
    'painting.description': 'Description',
    'painting.addToCart': 'Add to Cart',
    'painting.notFound.title': 'Painting Not Found',
    'painting.notFound.message': 'Sorry, this painting does not exist.',
    'painting.loading': 'Loading...',
    
    // Similar Request
    'similarRequest.title': 'Request Similar Painting',
    'similarRequest.originalPrice': 'Original Price',
    'similarRequest.name': 'Full Name',
    'similarRequest.namePlaceholder': 'Your full name',
    'similarRequest.email': 'Email Address',
    'similarRequest.emailPlaceholder': 'your@email.com',
    'similarRequest.phone': 'Phone Number',
    'similarRequest.phonePlaceholder': '+40 123 456 789',
    'similarRequest.preferredSize': 'Preferred Size',
    'similarRequest.sameSize': 'Same size as original',
    'similarRequest.smaller': 'Smaller than original',
    'similarRequest.larger': 'Larger than original',
    'similarRequest.custom': 'Custom dimensions',
    'similarRequest.width': 'Width',
    'similarRequest.height': 'Height',
    'similarRequest.budget': 'Budget Range',
    'similarRequest.minBudget': 'Minimum budget',
    'similarRequest.maxBudget': 'Maximum budget',
    'similarRequest.urgency': 'Urgency',
    'similarRequest.lowUrgency': 'No rush (2-3 months)',
    'similarRequest.mediumUrgency': 'Normal (1-2 months)',
    'similarRequest.highUrgency': 'Urgent (2-4 weeks)',
    'similarRequest.message': 'Additional Details',
    'similarRequest.messagePlaceholder': 'Describe any specific preferences, colors, or modifications you would like...',
    'similarRequest.send': 'Send Request',
    'similarRequest.sending': 'Sending...',
    'similarRequest.success': 'Your request has been sent successfully! We will contact you soon to discuss the details.',
    'similarRequest.error': 'Failed to send request. Please try again.',
    'similarRequest.button': 'Request Similar Painting',
    'similarRequest.soldMessage': 'This painting is sold, but we can create a similar one for you!',

    // Related Paintings
    'related.title': 'You Might Also Like',

    // Price Offer
    'offer.title': 'Make an Offer',
    'offer.currentPrice': 'Current Price',
    'offer.name': 'Full Name',
    'offer.namePlaceholder': 'Your full name',
    'offer.email': 'Email Address',
    'offer.emailPlaceholder': 'your@email.com',
    'offer.phone': 'Phone Number',
    'offer.phonePlaceholder': '+40 123 456 789',
    'offer.yourPrice': 'Your Offer',
    'offer.suggestions': 'Quick suggestions',
    'offer.message': 'Message (Optional)',
    'offer.messagePlaceholder': 'Tell us why you love this painting...',
    'offer.send': 'Send Offer',
    'offer.sending': 'Sending...',
    'offer.success': 'Your offer has been sent successfully! We will contact you soon.',
    'offer.error': 'Failed to send offer. Please try again.',
    'offer.button': 'Make an Offer',
    'offer.negotiable': 'Price Negotiable',

    // Custom Painting
    'customPainting.title': 'Order Custom Painting',
    'customPainting.subtitle': 'Bring your vision to life with a personalized artwork',
    'customPainting.inspiration.title': 'Your Inspiration',
    'customPainting.inspiration.uploadPhoto': 'Upload Reference Photo',
    'customPainting.inspiration.dragDrop': 'Drag and drop your image here',
    'customPainting.inspiration.selectFile': 'Select File',
    'customPainting.inspiration.description': 'Or describe your idea',
    'customPainting.inspiration.descriptionPlaceholder': 'Describe your vision: colors, mood, subject, style preferences...',
    'customPainting.specifications.title': 'Painting Specifications',
    'customPainting.specifications.size': 'Canvas Size',
    'customPainting.specifications.selectSize': 'Select size...',
    'customPainting.specifications.style': 'Painting Style',
    'customPainting.specifications.selectStyle': 'Select style...',
    'customPainting.specifications.artistStyleDescription': 'Specify artist or style',
    'customPainting.specifications.artistStylePlaceholder': 'e.g., Van Gogh, Monet, Renaissance style...',
    'customPainting.styles.realist': 'Realistic',
    'customPainting.styles.impressionist': 'Impressionist',
    'customPainting.styles.modern': 'Modern',
    'customPainting.styles.abstract': 'Abstract',
    'customPainting.styles.artistStyle': 'In the style of an artist',
    'customPainting.contact.title': 'Contact Information',
    'customPainting.contact.name': 'Full Name',
    'customPainting.contact.namePlaceholder': 'Your full name',
    'customPainting.contact.email': 'Email Address',
    'customPainting.contact.emailPlaceholder': 'your@email.com',
    'customPainting.contact.phone': 'Phone Number',
    'customPainting.contact.phonePlaceholder': '+40 123 456 789',
    'customPainting.submitButton': 'Request Quote',
    'customPainting.submitting': 'Sending request...',
    'customPainting.responseTime': 'You will receive a quote within 24 hours',
    'customPainting.success.title': 'Request Sent Successfully!',
    'customPainting.success.message': 'Your request has been sent. You will receive a quote within 24 hours.',
    'customPainting.success.backHome': 'Back to Homepage',
    'customPainting.imageUploaded': 'Image uploaded successfully',
    'customPainting.errors.invalidFile': 'Please select a valid image file',
    'customPainting.errors.fileTooLarge': 'File size must be less than 10MB',
    'customPainting.errors.uploadFailed': 'Failed to upload image',
    'customPainting.errors.descriptionOrPhoto': 'Please provide either a description or upload a photo',
    'customPainting.errors.submitFailed': 'Failed to send request. Please try again.',

    // About Page
    'about.title': 'About Me',
    'about.loading': 'Loading...',
    'about.artist.name': 'Victoria Ocara',
    'about.artist.subtitle': 'Oil Painting Artist • Impasto & blue-focused art',
    'about.artist.description': 'I am an artist passionate about oil painting, specialized in iconic urban landscapes and dramatic sunsets. My work is inspired by the beauty of nature and the emotions it evokes, using the impasto technique to create texture and depth in each piece.',
    'about.specialties.oil': 'Oil Painting',
    'about.specialties.urban': 'Urban Landscapes', 
    'about.specialties.impasto': 'Impasto Technique',
    'about.specialties.sunsets': 'Dramatic Sunsets',
    'about.readStory': 'Read My Story',
    'about.commission': 'Commission a Work',
    'about.social.follow': 'Follow me on social media',
    'about.contact.commission': 'Contact Me for Commissions',
    'about.story.title': 'My Artistic Story',
    'about.passion.title': 'Passion for Blue',
    'about.passion.description1': 'Blue is not just a color in my art - it is the language through which I express my emotions and vision. Each shade of blue tells a different story, from the tranquility of the sky to the depth of the ocean.',
    'about.passion.description2': 'The impasto technique allows me to create rich and expressive textures, bringing life and dimension to each canvas through thick layers of color.',
    'about.inspiration.title': 'Inspirations & Style',
    'about.inspiration.urban': 'Iconic urban landscapes - Paris, Eiffel Tower',
    'about.inspiration.sunsets': 'Dramatic sunsets and sunrises',
    'about.inspiration.impasto': 'Impasto technique for rich textures',
    'about.inspiration.palette': 'Blue and orange palette',
    'about.inspiration.masters': 'Inspiration from Monet and Van Gogh',
    'about.studio.title': 'In My Studio',
    'about.studio.description1': 'Each painting comes to life in my studio, where passion for color and texture transforms into unique works of art. I work with the impasto technique, creating thick layers of paint that give dimension and life to each canvas.',
    'about.studio.description2': 'Urban landscapes, especially those with the Eiffel Tower, are a constant source of inspiration. I love to capture the play of light and shadow, the contrast between the blue sky and the warmth of orange sunsets.',
    'about.process.title': 'My Creative Process',
    'about.process.step1': 'Sketch the composition on canvas',
    'about.process.step2': 'Apply base layers with broad brushes',
    'about.process.step3': 'Build texture with impasto technique',
    'about.process.step4': 'Finalize details and contrasts',
    'about.technique.title': 'My Technique',
    'about.technique.urban.title': 'Urban Landscapes',
    'about.technique.urban.description': 'Specialized in iconic landscapes - Eiffel Tower, Paris',
    'about.technique.sunsets.title': 'Dramatic Sunsets',
    'about.technique.sunsets.description': 'Capturing the play of light and color in spectacular sunsets',
    'about.technique.impasto.title': 'Impasto Technique',
    'about.technique.impasto.description': 'Thick layers of paint for expressive and vibrant textures',
    'about.commission.title': 'Custom Commissions',
    'about.commission.description': 'I can create a unique work for you, personalized according to your vision. Each commission is a special artistic collaboration.',
    'about.commission.request': 'Request a Commission',
    'about.commission.portfolio': 'View Portfolio',
    
    // Contact Page
    'contact.title': 'Contact',
    'contact.subtitle': 'Have questions? We would love to hear from you!',
    'contact.name': 'Name',
    'contact.email': 'Email',
    'contact.phone': 'Phone',
    'contact.message': 'Message',
    'contact.send': 'Send Message',
    'contact.sendForm': 'Send us a Message',
    'contact.info.title': 'Contact Information',
    'contact.info.email': 'Email',
    'contact.info.phone': 'Phone',
    'contact.info.address': 'Address',
    'contact.info.hours': 'Working Hours',
    'contact.info.social': 'Follow me on social media',
    
    // Cart
    'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty',
    'cart.continueShopping': 'Continue Shopping',
    'cart.quantity': 'Quantity',
    'cart.price': 'Price',
    'cart.total': 'Total',
    'cart.remove': 'Remove',
    'cart.checkout': 'Proceed to Checkout',
    
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.orderSummary': 'Order Summary',
    'checkout.shippingInfo': 'Shipping Information',
    'checkout.firstName': 'First Name',
    'checkout.lastName': 'Last Name',
    'checkout.address': 'Address',
    'checkout.city': 'City',
    'checkout.postalCode': 'Postal Code',
    'checkout.country': 'Country',
    'checkout.phone': 'Phone',
    'checkout.placeOrder': 'Place Order',
    'checkout.processing': 'Processing...',
    
    // Success
    'success.title': 'Order Successful!',
    'success.message': 'Thank you for your purchase. You will receive a confirmation email shortly.',
    'success.orderNumber': 'Order Number',
    'success.backToGallery': 'Back to Gallery',
    
    // Footer
    'footer.followUs': 'Follow Us',
    'footer.rights': 'All rights reserved.',
    'footer.artist': 'Victoria Ocara',
    'footer.description': 'Original paintings created with passion and dedication.',
    'footer.links': 'Useful Links',
    
    // Features Section
    'features.original.title': 'Original Art',
    'features.original.description': 'Each painting is a unique work, created by hand with attention to detail',
    'features.delivery.title': 'Safe Delivery', 
    'features.delivery.description': 'We pack and ship each painting with maximum care for its safety',
    'features.payment.title': 'Secure Payment',
    'features.payment.description': 'We process payments through Stripe for your safety and privacy',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.add': 'Add',
    'common.update': 'Update',
  },
  ro: {
    // Navigation
    'nav.home': 'Acasă',
    'nav.gallery': 'Galerie',
    'nav.customPainting': 'Comandă Pictură',
    'nav.about': 'Despre',
    'nav.contact': 'Contact',
    'nav.cart': 'Coș',
    'nav.language': 'Limbă',
    
    // Homepage
    'home.hero.title': 'Artă Originală',
    'home.hero.subtitle': 'Descoperă tablouri unice în ulei inspirate de natură și emoție',
    'home.hero.cta': 'Explorează Galeria',
    'home.hero.contact': 'Contactează Artistul',
    'home.featured.title': 'Lucrări Selectate',
    'home.featured.viewAll': 'Vezi Toate Tablourile',
    'home.featured.noFeatured': 'Nu există tablouri selectate momentan.',
    'home.featured.addFromAdmin': 'Pentru a afișa tablouri aici, adaugă tablouri în panoul admin și bifează "Featured on Homepage".',
    'home.about.title': 'Despre Artist',
    
    // Gallery
    'gallery.title': 'Galerie',
    'gallery.subtitle': 'Explorează colecția noastră completă de tablouri originale',
    'gallery.showSold': 'Afișează tablourile vândute',
    'gallery.loading': 'Se încarcă tablourile...',
    'gallery.error': 'Eroare la încărcarea tablourilor',
    'gallery.tryAgain': 'Încearcă din nou',
    'gallery.noPaintings': 'Nu există tablouri disponibile momentan.',
    'gallery.addFromAdmin': 'Adaugă tablouri din panoul admin pentru a le vedea aici.',
    
    // Painting Card
    'painting.available': 'Disponibil',
    'painting.sold': 'Vândut',
    
    // Individual Painting
    'painting.dimensions': 'Dimensiuni',
    'painting.technique': 'Tehnică',
    'painting.available.status': 'Disponibil',
    'painting.sold.status': 'Vândut',
    'painting.outOfStock': 'Stoc epuizat',
    'painting.description': 'Descriere',
    'painting.addToCart': 'Adaugă în Coș',
    'painting.notFound.title': 'Tablou negăsit',
    'painting.notFound.message': 'Ne pare rău, acest tablou nu există.',
    'painting.loading': 'Se încarcă...',
    
    // Similar Request
    'similarRequest.title': 'Cere un Tablou Similar',
    'similarRequest.originalPrice': 'Preț Original',
    'similarRequest.name': 'Nume Complet',
    'similarRequest.namePlaceholder': 'Numele tău complet',
    'similarRequest.email': 'Adresă Email',
    'similarRequest.emailPlaceholder': 'email@tau.com',
    'similarRequest.phone': 'Număr Telefon',
    'similarRequest.phonePlaceholder': '+40 123 456 789',
    'similarRequest.preferredSize': 'Dimensiune Preferată',
    'similarRequest.sameSize': 'Aceeași dimensiune ca originalul',
    'similarRequest.smaller': 'Mai mic decât originalul',
    'similarRequest.larger': 'Mai mare decât originalul',
    'similarRequest.custom': 'Dimensiuni personalizate',
    'similarRequest.width': 'Lățime',
    'similarRequest.height': 'Înălțime',
    'similarRequest.budget': 'Buget Estimat',
    'similarRequest.minBudget': 'Buget minim',
    'similarRequest.maxBudget': 'Buget maxim',
    'similarRequest.urgency': 'Urgența',
    'similarRequest.lowUrgency': 'Fără grabă (2-3 luni)',
    'similarRequest.mediumUrgency': 'Normal (1-2 luni)',
    'similarRequest.highUrgency': 'Urgent (2-4 săptămâni)',
    'similarRequest.message': 'Detalii Suplimentare',
    'similarRequest.messagePlaceholder': 'Descrie orice preferințe specifice, culori sau modificări pe care le-ai dori...',
    'similarRequest.send': 'Trimite Cererea',
    'similarRequest.sending': 'Se trimite...',
    'similarRequest.success': 'Cererea ta a fost trimisă cu succes! Te vom contacta în curând pentru a discuta detaliile.',
    'similarRequest.error': 'Nu s-a putut trimite cererea. Te rugăm să încerci din nou.',
    'similarRequest.button': 'Cere un Tablou Similar',
    'similarRequest.soldMessage': 'Acest tablou este vândut, dar putem crea unul similar pentru tine!',

    // Related Paintings
    'related.title': 'Ți-ar putea plăcea și',

    // Price Offer
    'offer.title': 'Fă o Ofertă',
    'offer.currentPrice': 'Preț Actual',
    'offer.name': 'Nume Complet',
    'offer.namePlaceholder': 'Numele tău complet',
    'offer.email': 'Adresă Email',
    'offer.emailPlaceholder': 'email@tau.com',
    'offer.phone': 'Număr Telefon',
    'offer.phonePlaceholder': '+40 123 456 789',
    'offer.yourPrice': 'Oferta Ta',
    'offer.suggestions': 'Sugestii rapide',
    'offer.message': 'Mesaj (Opțional)',
    'offer.messagePlaceholder': 'Spune-ne de ce îți place acest tablou...',
    'offer.send': 'Trimite Oferta',
    'offer.sending': 'Se trimite...',
    'offer.success': 'Oferta ta a fost trimisă cu succes! Te vom contacta în curând.',
    'offer.error': 'Nu s-a putut trimite oferta. Te rugăm să încerci din nou.',
    'offer.button': 'Fă o Ofertă',
    'offer.negotiable': 'Preț Negociabil',

    // Custom Painting
    'customPainting.title': 'Comandă Pictură Personalizată',
    'customPainting.subtitle': 'Dă viață viziunii tale cu o operă de artă personalizată',
    'customPainting.inspiration.title': 'Inspirația Ta',
    'customPainting.inspiration.uploadPhoto': 'Încarcă Fotografie de Referință',
    'customPainting.inspiration.dragDrop': 'Trage și plasează imaginea aici',
    'customPainting.inspiration.selectFile': 'Selectează Fișier',
    'customPainting.inspiration.description': 'Sau descrie ideea ta',
    'customPainting.inspiration.descriptionPlaceholder': 'Descrie viziunea ta: culori, atmosferă, subiect, preferințe de stil...',
    'customPainting.specifications.title': 'Specificații Pictură',
    'customPainting.specifications.size': 'Dimensiunea Pânzei',
    'customPainting.specifications.selectSize': 'Selectează dimensiunea...',
    'customPainting.specifications.style': 'Stilul Picturii',
    'customPainting.specifications.selectStyle': 'Selectează stilul...',
    'customPainting.specifications.artistStyleDescription': 'Specifică artistul sau stilul',
    'customPainting.specifications.artistStylePlaceholder': 'ex. Van Gogh, Monet, stil renascentist...',
    'customPainting.styles.realist': 'Realist',
    'customPainting.styles.impressionist': 'Impresionist',
    'customPainting.styles.modern': 'Modern',
    'customPainting.styles.abstract': 'Abstract',
    'customPainting.styles.artistStyle': 'În stilul unui artist',
    'customPainting.contact.title': 'Informații de Contact',
    'customPainting.contact.name': 'Nume Complet',
    'customPainting.contact.namePlaceholder': 'Numele tău complet',
    'customPainting.contact.email': 'Adresă Email',
    'customPainting.contact.emailPlaceholder': 'email@tau.com',
    'customPainting.contact.phone': 'Număr Telefon',
    'customPainting.contact.phonePlaceholder': '+40 123 456 789',
    'customPainting.submitButton': 'Cere Ofertă',
    'customPainting.submitting': 'Se trimite cererea...',
    'customPainting.responseTime': 'Vei primi oferta în cel mult 24 ore',
    'customPainting.success.title': 'Cererea a fost Trimisă cu Succes!',
    'customPainting.success.message': 'Cererea ta a fost trimisă. Vei primi oferta în cel mult 24 ore.',
    'customPainting.success.backHome': 'Înapoi la Pagina Principală',
    'customPainting.imageUploaded': 'Imaginea a fost încărcată cu succes',
    'customPainting.errors.invalidFile': 'Te rugăm să selectezi un fișier imagine valid',
    'customPainting.errors.fileTooLarge': 'Dimensiunea fișierului trebuie să fie mai mică de 10MB',
    'customPainting.errors.uploadFailed': 'Nu s-a putut încărca imaginea',
    'customPainting.errors.descriptionOrPhoto': 'Te rugăm să furnizezi o descriere sau să încarci o fotografie',
    'customPainting.errors.submitFailed': 'Nu s-a putut trimite cererea. Te rugăm să încerci din nou.',

    // About Page
    'about.title': 'Despre Mine',
    'about.loading': 'Se încarcă...',
    'about.artist.name': 'Victoria Ocara',
    'about.artist.subtitle': 'Artistă specializată în pictura cu ulei • Artă impasto & focalizată pe albastru',
    'about.artist.description': 'Sunt o artistă pasionată de pictura cu ulei, specializată în peisaje urbane iconice și apusuri dramatice. Lucrările mele sunt inspirate de frumusețea naturii și de emoțiile pe care le evocă, folosind tehnica impasto pentru a crea textură și profunzime în fiecare piesă.',
    'about.specialties.oil': 'Pictura cu Ulei',
    'about.specialties.urban': 'Peisaje Urbane',
    'about.specialties.impasto': 'Tehnica Impasto', 
    'about.specialties.sunsets': 'Apusuri Dramatice',
    'about.readStory': 'Citește Povestea Mea',
    'about.commission': 'Comandă o Lucrare',
    'about.social.follow': 'Urmărește-mă pe rețelele sociale',
    'about.contact.commission': 'Contactează-mă pentru Comisii',
    'about.story.title': 'Povestea Mea Artistică',
    'about.passion.title': 'Pasiunea pentru Albastru',
    'about.passion.description1': 'Albastrul nu este doar o culoare în arta mea - este limbajul prin care îmi exprim emoțiile și viziunea. Fiecare nuanță de albastru povestește o poveste diferită, de la liniștea cerului până la profunzimea oceanului.',
    'about.passion.description2': 'Tehnica impasto îmi permite să creez texturi bogate și expresive, aducând viață și dimensiune fiecărei pânze prin straturi groase de culoare.',
    'about.inspiration.title': 'Inspirații & Stil',
    'about.inspiration.urban': 'Peisaje urbane iconice - Paris, Turnul Eiffel',
    'about.inspiration.sunsets': 'Apusuri și răsărituri dramatice',
    'about.inspiration.impasto': 'Tehnica impasto pentru texturi bogate',
    'about.inspiration.palette': 'Paleta de albastru și portocaliu',
    'about.inspiration.masters': 'Inspirație din Monet și Van Gogh',
    'about.studio.title': 'În Atelierul Meu',
    'about.studio.description1': 'Fiecare tablou prinde viață în atelierul meu, unde pasiunea pentru culoare și textură se transformă în opere de artă unice. Lucrez cu tehnica impasto, creând straturi groase de vopsea care dau dimensiune și viață fiecărei pânze.',
    'about.studio.description2': 'Peisajele urbane, în special cele cu Turnul Eiffel, sunt o sursă constantă de inspirație. Îmi place să surprind jocul de lumină și umbră, contrastul dintre cerul albastru și căldura apusurilor portocalii.',
    'about.process.title': 'Procesul Meu Creativ',
    'about.process.step1': 'Schițez compoziția pe pânză',
    'about.process.step2': 'Aplic straturile de bază cu pensule late',
    'about.process.step3': 'Construiesc textura cu tehnica impasto',
    'about.process.step4': 'Finalizez detaliile și contrastele',
    'about.technique.title': 'Tehnica Mea',
    'about.technique.urban.title': 'Peisaje Urbane',
    'about.technique.urban.description': 'Specializată în peisaje iconice - Turnul Eiffel, Paris',
    'about.technique.sunsets.title': 'Apusuri Dramatice',
    'about.technique.sunsets.description': 'Captez jocul de lumină și culoare în apusuri spectaculoase',
    'about.technique.impasto.title': 'Tehnica Impasto',
    'about.technique.impasto.description': 'Straturi groase de vopsea pentru texturi expresive și vibrante',
    'about.commission.title': 'Comisii Personalizate',
    'about.commission.description': 'Îți pot crea o lucrare unică, personalizată după viziunea ta. Fiecare comision este o colaborare artistică specială.',
    'about.commission.request': 'Solicită o Comision',
    'about.commission.portfolio': 'Vezi Portofoliul',
    
    // Contact Page
    'contact.title': 'Contact',
    'contact.subtitle': 'Ai întrebări? Ne-ar plăcea să auzim de la tine!',
    'contact.name': 'Nume',
    'contact.email': 'Email',
    'contact.phone': 'Telefon',
    'contact.message': 'Mesaj',
    'contact.send': 'Trimite Mesajul',
    'contact.sendForm': 'Trimite-ne un Mesaj',
    'contact.info.title': 'Informații de Contact',
    'contact.info.email': 'Email',
    'contact.info.phone': 'Telefon',
    'contact.info.address': 'Adresă',
    'contact.info.hours': 'Program de Lucru',
    'contact.info.social': 'Urmărește-mă pe rețelele sociale',
    
    // Cart
    'cart.title': 'Coșul de Cumpărături',
    'cart.empty': 'Coșul tău este gol',
    'cart.continueShopping': 'Continuă Cumpărăturile',
    'cart.quantity': 'Cantitate',
    'cart.price': 'Preț',
    'cart.total': 'Total',
    'cart.remove': 'Elimină',
    'cart.checkout': 'Finalizează Comanda',
    
    // Checkout
    'checkout.title': 'Finalizare Comandă',
    'checkout.orderSummary': 'Sumar Comandă',
    'checkout.shippingInfo': 'Informații de Livrare',
    'checkout.firstName': 'Prenume',
    'checkout.lastName': 'Nume',
    'checkout.address': 'Adresă',
    'checkout.city': 'Oraș',
    'checkout.postalCode': 'Cod Poștal',
    'checkout.country': 'Țară',
    'checkout.phone': 'Telefon',
    'checkout.placeOrder': 'Plasează Comanda',
    'checkout.processing': 'Se procesează...',
    
    // Success
    'success.title': 'Comandă Reușită!',
    'success.message': 'Mulțumim pentru achiziție. Vei primi un email de confirmare în scurt timp.',
    'success.orderNumber': 'Numărul Comenzii',
    'success.backToGallery': 'Înapoi la Galerie',
    
    // Footer
    'footer.followUs': 'Urmărește-ne',
    'footer.rights': 'Toate drepturile rezervate.',
    'footer.artist': 'Victoria Ocara',
    'footer.description': 'Tablouri originale create cu pasiune și dedicare.',
    'footer.links': 'Linkuri Utile',
    
    // Features Section
    'features.original.title': 'Artă Originală',
    'features.original.description': 'Fiecare tablou este o lucrare unică, creată manual cu atenție la detalii',
    'features.delivery.title': 'Livrare Sigură',
    'features.delivery.description': 'Ambalăm și expediem fiecare tablou cu grijă maximă pentru siguranța sa',
    'features.payment.title': 'Plată Securizată',
    'features.payment.description': 'Procesăm plățile prin Stripe pentru siguranța și confidențialitatea ta',
    
    // Common
    'common.loading': 'Se încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    'common.cancel': 'Anulează',
    'common.save': 'Salvează',
    'common.edit': 'Editează',
    'common.delete': 'Șterge',
    'common.add': 'Adaugă',
    'common.update': 'Actualizează',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ro'>('en'); // Default to English

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as 'en' | 'ro';
    if (savedLanguage) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: 'en' | 'ro') => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['en']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};