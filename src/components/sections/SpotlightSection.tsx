import { motion } from 'framer-motion';

export function SpotlightSection() {
  return (
    <section className="section-padding-lg bg-background">
      <div className="container-editorial">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="subheading mb-4">Our Philosophy</p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-medium leading-tight mb-6">
            Less, But Better.
          </h2>
          <p className="body-lg max-w-2xl mx-auto">
            We believe in the power of restraint. In a world of endless options, 
            we choose to focus on what matters: exceptional materials, thoughtful 
            construction, and designs that stand the test of time.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
