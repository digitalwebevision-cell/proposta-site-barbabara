# Víbora Ink · site

Site institucional da Víbora Ink em HTML5, CSS3 e JavaScript puro (sem bibliotecas externas).

```
index.html                  página principal (todas as seções)
politica-de-privacidade.html
style.css                   estilos, organizados por seção
script.js                   menu, animações, galeria/lightbox, FAQ e formulários
assets/images               imagens (hoje, ilustrações provisórias em SVG + og-image.png)
assets/icons                favicon e ícone para iPhone
assets/fonts                Cormorant Garamond e Manrope (licença SIL OFL)
```

Para visualizar, abra `index.html` no navegador ou rode `python3 -m http.server` nesta pasta.

## O que precisa ser preenchido

Nenhuma informação sobre a marca foi inventada. Tudo que é provisório está marcado:

- no HTML, com comentários `<!-- PLACEHOLDER: ... -->`;
- na página, com texto entre colchetes e sublinhado tracejado ciano (classe `.ph`).

Busque por `PLACEHOLDER` e `class="ph"` para encontrar todos os pontos.

| Onde | O que fazer |
| --- | --- |
| `script.js` → `CONFIG` | Informar WhatsApp (só números, com 55 + DDD) e e-mail. Sem eles, botões e formulários abrem o Instagram e copiam a mensagem. |
| Hero, Eventos, CTA final | Trocar as imagens `*-placeholder.svg` por fotos reais (JPG/WebP). |
| Trabalhos | Trocar `trabalho-01.svg` … `trabalho-09.svg`, o `alt` e o `data-caption` de cada foto. |
| Filtros da galeria | Adicionar `data-style="Nome do estilo"` em cada `<figure class="work">`. Os filtros aparecem sozinhos. |
| Sobre | Texto e foto já preenchidos. A foto `tatuadora.jpg` foi recortada de um print: trocar pelo arquivo original em alta resolução (quadrado, mín. 1000px). |
| Promoções | Já preenchidas (Tattoo Packs, Rodízio, Indique e Ganhe). Ao mudar preços, atualizar também o `data-contact` de cada botão. |
| Parcerias | Remover `hidden` do bloco `.partners` quando houver parceiros reais. |
| Feedback | Remover `hidden` de `.testimonials` para exibir avaliações reais. |
| FAQ | Escrever as respostas. |
| Contato | Localização, se for divulgada (ou remover o item). |
| SEO | Domínio definitivo em `canonical` e `og:image` (a imagem `og-image.png` já existe; use a URL absoluta). |
| Compromissos (Sobre) | Revisar os 4 itens da faixa `.pillars` e, se confirmado, incluir biossegurança. |
| Privacidade | Texto da política de privacidade. |

## Formulários

Não há servidor. Os formulários de Eventos e Guest Spot montam uma mensagem com os campos e a enviam pelo canal configurado (WhatsApp, depois e-mail, depois Instagram).
