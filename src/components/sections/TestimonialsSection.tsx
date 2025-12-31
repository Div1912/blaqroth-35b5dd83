import { motion } from 'framer-motion';
import { Quote } from 'lucide-react';

const testimonials = [
  {
    id: 1,
    quote: "BLAQROTH understands that luxury isn't about excess—it's about intention. Every piece in my wardrobe from them feels essential.",
    author: "Alexandra Chen",
    role: "Creative Director",
  },
  {
    id: 2,
    quote: "The quality is exceptional, but what sets them apart is the design philosophy. These aren't clothes that shout; they whisper with confidence.",
    author: "Marcus Webb",
    role: "Architect",
  },
  {
    id: 3,
    quote: "I've worn their pieces to boardrooms and galleries. They work everywhere because they're designed for people, not occasions.",
    author: "Sophia Laurent",
    role: "Gallery Curator",
  },
];

export function TestimonialsSection() {
  return (
    <section className="section-padding relative z-10">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-primary tracking-[0.4em] uppercase text-sm mb-4 block">
            Voices
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-light tracking-wider">
            In Their Words
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-panel p-8 md:p-10 hover-lift"
            >
              <Quote className="h-8 w-8 text-primary/50 mb-6" />
              <blockquote className="text-foreground/90 text-lg leading-relaxed mb-8">
                "{testimonial.quote}"
              </blockquote>
              <div>
                <p className="font-display text-xl">{testimonial.author}</p>
                <p className="text-muted-foreground text-sm mt-1">
                  {testimonial.role}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
