// Script pentru actualizarea descrierilor tablourilor
const paintings = [
  {
    slug: 'sunset',
    title: { en: 'Sunset', ro: 'Apus de soare' },
    description: {
      en: 'A breathtaking sunset over a tranquil sea, painted with rich impasto technique. The warm golden and orange hues blend seamlessly with deep blues, creating a mesmerizing reflection on the calm waters. This piece captures the serene moment when day transitions to night, evoking feelings of peace and contemplation. The thick application of paint adds texture and depth, making the light seem to dance across the canvas.',
      ro: 'Un apus de soare uluitoare peste o mare liniștită, pictat cu tehnica bogată impasto. Nuanțele calde de aur și portocaliu se îmbină perfect cu albastrul profund, creând o reflecție fascinantă pe apele calme. Această lucrare surprinde momentul senin când ziua trece în noapte, evocând sentimente de pace și contemplare. Aplicarea groasă a vopselei adaugă textură și profunzime, făcând lumina să pară că dansează pe pânză.'
    }
  },
  {
    slug: 'mare-galbena',
    title: { en: 'Golden Sea', ro: 'Mare Galbena' },
    description: {
      en: 'An abstract interpretation of the sea in golden tones, showcasing the artist\'s signature impasto technique. The painting captures the essence of sunlight dancing on ocean waves, with bold brushstrokes creating movement and energy. The dominant yellow and gold palette evokes warmth and joy, while subtle blue undertones add depth and mystery. This piece represents the eternal dance between light and water.',
      ro: 'O interpretare abstractă a mării în tonuri aurii, prezentând tehnica impasto caracteristică artistei. Pictura surprinde esența luminii solare dansând pe valurile oceanului, cu pensulări îndrăznețe care creează mișcare și energie. Paleta dominantă de galben și aur evocă căldură și bucurie, în timp ce subtonurile subtile de albastru adaugă profunzime și mister. Această lucrare reprezintă dansul etern dintre lumină și apă.'
    }
  },
  {
    slug: 'lalele',
    title: { en: 'Tulips', ro: 'Lalele' },
    description: {
      en: 'Vibrant tulips painted against a rich blue background, demonstrating the artist\'s mastery of color contrast and impasto technique. The flowers seem to emerge from the canvas with their bold red and pink petals, while the deep blue backdrop creates a striking visual impact. Each brushstroke is deliberate and expressive, capturing the delicate beauty and strength of these spring flowers. The painting celebrates the renewal of life and the joy of blooming.',
      ro: 'Lalele vibrante pictate pe un fundal albastru bogat, demonstrând măiestria artistei în contrastul de culori și tehnica impasto. Florile par să iasă din pânză cu petalele lor îndrăznețe roșii și roz, în timp ce fundalul albastru profund creează un impact vizual izbitor. Fiecare pensulare este deliberată și expresivă, surprinzând frumusețea delicată și puterea acestor flori de primăvară. Pictura celebrează reînnoirea vieții și bucuria înfloririi.'
    }
  }
];

console.log('Paintings with updated descriptions:');
console.log(JSON.stringify(paintings, null, 2));