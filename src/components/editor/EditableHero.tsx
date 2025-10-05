import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { DirectusService } from "@/services/directusService";
import { UniversalContentEditor } from "@/components/universal/UniversalContentEditor";
import useDirectusEditorContext from "@/hooks/useDirectusEditorContext";
import type { DirectusHero } from "@/lib/directus";

interface EditableHeroProps {
  isEditing?: boolean;
  onSave?: (data: DirectusHero) => void;
}

const EditableHero = () => {
  const [heroData, setHeroData] = useState<DirectusHero>({
    title: "",
    subtitle: "",
    primary_button_text: "",
    primary_button_link: "",
  });
  const [loading, setLoading] = useState(true);
  const [heroId, setHeroId] = useState<string | null>(null);
  const { isInDirectusEditor, isAuthenticated } = useDirectusEditorContext();
  const canEdit = isInDirectusEditor || isAuthenticated;

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


  if (loading) {
    return <div className="animate-pulse bg-gray-200 h-96 rounded-lg" />;
  }


  return (
    <section className="relative isolate overflow-hidden">
      <div className="bg-hero">
        <div className="container flex min-h-[60vh] flex-col items-start justify-center py-16">
          <p className="mb-2 inline-flex items-center rounded-full border px-3 py-1 text-xs tracking-wide text-primary">
            Especialistas em eletrónica automóvel
          </p>
          
          <UniversalContentEditor
            collection="hero"
            itemId={heroId || '1'}
            field="title"
            value={heroData.title || ''}
            tag="h1"
            className="max-w-3xl text-balance text-4xl font-extrabold leading-[1.15] md:leading-[1.15] md:text-6xl pr-4 pb-[0.15em] tracking-wider [text-decoration:none] dark:text-white"
            style={{ color: 'hsl(var(--primary))' }}
          />
          
          <UniversalContentEditor
            collection="hero"
            itemId={heroId || '1'}
            field="subtitle"
            value={heroData.subtitle || ''}
            tag="p"
            className="mt-4 max-w-2xl text-lg [text-decoration:none] dark:text-white"
            style={{ color: 'hsl(var(--primary))' }}
          />
          
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" variant="hero">
              <Link to={heroData.primary_button_link || "/servicos"}>
                <UniversalContentEditor
                  collection="hero"
                  itemId={heroId || '1'}
                  field="primary_button_text"
                  value={heroData.primary_button_text || ''}
                  tag="span"
                />
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