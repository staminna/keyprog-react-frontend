import React from 'react';
import { Link } from 'react-router-dom';
import { DEFAULT_NOT_FOUND_MESSAGE } from '@/data/menuCorrections';
import { Button } from '@/components/ui/button';
import { AlertCircle } from 'lucide-react';

interface NotFoundContentProps {
  title?: string;
  message?: string;
  backLink?: string;
  backText?: string;
}

/**
 * Component to display when content is not found
 */
export function NotFoundContent({
  title = "Conteúdo não encontrado",
  message = DEFAULT_NOT_FOUND_MESSAGE,
  backLink = "/",
  backText = "Voltar à página inicial"
}: NotFoundContentProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <AlertCircle className="h-16 w-16 text-amber-500 mb-4" />
      <h2 className="text-2xl font-bold mb-2">{title}</h2>
      <p className="text-muted-foreground mb-6 max-w-md">{message}</p>
      <Button asChild>
        <Link to={backLink}>{backText}</Link>
      </Button>
    </div>
  );
}

export default NotFoundContent;
