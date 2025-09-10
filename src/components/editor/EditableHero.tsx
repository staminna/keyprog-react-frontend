import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { DirectusService } from "@/services/directusService";
import { InlineText } from "@/components/inline";
import { useInlineEditContext } from "@/components/inline/InlineEditProvider";
import type { DirectusHero } from "@/lib/directus";

interface EditableHeroProps {
  isEditing?: boolean;
  onSave?: (data: DirectusHero) => void;
}

const EditableHero = ({ isEditing = false, onSave }: EditableHeroProps) => {
  const [heroData, setHeroData] = useState<DirectusHero>({
    title: "",
    subtitle: "",
    primary_button_text: "",
    primary_button_link: "",
  });
  const [loading, setLoading] = useState(true);
  const [heroId, setHeroId] = useState<string | null>(null);
  const { showEditMode } = useInlineEditContext();

  useEffect(() => {
    const loadHeroData = async () => {
      try {
        setLoading(true);
        const data = await DirectusService.getHero();
        setHeroData(data);
        setHeroId('1'); // Use fixed ID for hero collection
        console.log('Hero data loaded successfully:', data);
      } catch (error) {
        console.error("Error loading hero data:", error);
        // Use fallback data
        setHeroData({
          title: "Performance, diagnóstico e soluções para a sua centralina",
          subtitle: "Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software.",
          primary_button_text: "Ver Serviços",
          primary_button_link: "/servicos",
        });
      } finally {
        setLoading(false);
      }
    };

    loadHeroData();
  }, []);

  const handleInputChange = (field: keyof DirectusHero, value: string) => {
    setHeroData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      await DirectusService.updateHero(heroData);
      if (onSave) {
        onSave(heroData);
      }
      // Show success message
      console.log('Hero data saved successfully!');
    } catch (error) {
      console.error('Failed to save hero data:', error);
      // Show error message
      alert('Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />;
  }

  if (isEditing) {
    return (
      <Card className="w-full max-w-4xl mx-auto my-8">
        <CardHeader>
          <CardTitle>Edit Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Title</label>
            <Input
              value={heroData.title || ""}
              onChange={(e) => handleInputChange("title", e.target.value)}
              placeholder="Hero title"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium mb-2 block">Subtitle</label>
            <Textarea
              value={heroData.subtitle || ""}
              onChange={(e) => handleInputChange("subtitle", e.target.value)}
              placeholder="Hero subtitle"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Button Text</label>
              <Input
                value={heroData.primary_button_text || ""}
                onChange={(e) => handleInputChange("primary_button_text", e.target.value)}
                placeholder="Button text"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Primary Button Link</label>
              <Input
                value={heroData.primary_button_link || ""}
                onChange={(e) => handleInputChange("primary_button_link", e.target.value)}
                placeholder="Button link (e.g., /servicos)"
              />
            </div>
          </div>
          
          <Button onClick={handleSave} className="w-full" disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </Button>
          
          <div className="mt-6 border-t pt-4">
            <h3 className="text-sm font-medium mb-2">Preview:</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <EditableHero isEditing={false} />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <section className="relative isolate overflow-hidden">
      <div className="bg-hero">
        <div className="container flex min-h-[60vh] flex-col items-start justify-center py-16">
          <p className="mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide text-primary">
            Especialistas em eletrónica automóvel
          </p>
          
          {showEditMode && heroId ? (
            <InlineText
              collection="hero"
              itemId={heroId}
              field="title"
              value={heroData.title}
              placeholder="Hero title"
              className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.15] md:leading-[1.15] text-gradient-primary md:text-6xl pr-4 pb-[0.15em]"
            />
          ) : (
            <h1 className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.15] md:leading-[1.15] text-gradient-primary md:text-6xl pr-4 pb-[0.15em]" style={{letterSpacing: '0.05em'}}>
              {heroData.title || "Performance, diagnóstico e soluções para a sua centralina"}&nbsp;
            </h1>
          )}
          
          {showEditMode && heroId ? (
            <InlineText
              collection="hero"
              itemId={heroId}
              field="subtitle"
              value={heroData.subtitle}
              placeholder="Hero subtitle"
              multiline
              className="mt-4 max-w-2xl text-lg text-muted-foreground"
            />
          ) : (
            <p className="mt-4 max-w-2xl text-lg text-muted-foreground">
              {heroData.subtitle || "Reprogramação, desbloqueio, clonagem, reparações e uma loja completa de equipamentos, emuladores e software."}
            </p>
          )}
          
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="hero">
              <Link to={heroData.primary_button_link || "/servicos"}>
                {showEditMode && heroId ? (
                  <InlineText
                    collection="hero"
                    itemId={heroId}
                    field="primary_button_text"
                    value={heroData.primary_button_text}
                    placeholder="Button text"
                    showEditIcon={false}
                  />
                ) : (
                  heroData.primary_button_text || "Ver Serviços"
                )}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/loja">Ir para a Loja</Link>
            </Button>
          </div>
        </div>
      </div>
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(600px_circle_at_10%_0%,hsla(var(--primary),0.12),transparent_60%),radial-gradient(700px_circle_at_90%_0%,hsla(var(--primary),0.08),transparent_60%)]" />
    </section>
  );
};

export default EditableHero;