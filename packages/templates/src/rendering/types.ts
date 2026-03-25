export interface TemplateRenderRequest {
  templateSlug: string;
  variables: Record<string, string | number | boolean>;
}

export interface TemplateRenderer {
  render(request: TemplateRenderRequest): Promise<string>;
}
