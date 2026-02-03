import { Sparkles, TrendingUp, Clock, Play } from "lucide-react";

interface HeroSectionProps {
  title: string;
  description: string;
  icon?: "sparkles" | "trending" | "clock" | "play";
}

const icons = {
  sparkles: Sparkles,
  trending: TrendingUp,
  clock: Clock,
  play: Play,
};

export function HeroSection({ title, description, icon = "sparkles" }: HeroSectionProps) {
  const IconComponent = icons[icon];

  return (
    <div className="pt-20 pb-8 md:pt-24 md:pb-12">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <IconComponent className="w-6 h-6 text-primary" />
          </div>
          <h1 className="font-display font-semibold text-2xl md:text-3xl lg:text-4xl text-foreground">
            {title}
          </h1>
        </div>
        <p className="text-muted-foreground text-base max-w-2xl">
          {description}
        </p>
      </div>
    </div>
  );
}
