import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md mx-auto px-6">
        <h1 className="font-display text-8xl md:text-9xl text-primary mb-4">404</h1>
        <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-4">
          Page Not Found
        </h2>
        <p className="text-muted-foreground text-lg mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Button variant="hero" size="lg" asChild>
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
