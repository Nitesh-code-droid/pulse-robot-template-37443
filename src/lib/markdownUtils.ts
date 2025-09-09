/**
 * Utility functions for converting markdown formatting to HTML
 */

/**
 * Converts **text** markdown syntax to <b>text</b> HTML tags
 * @param text - The text containing markdown bold syntax
 * @returns Text with HTML bold tags
 */
export function convertMarkdownBold(text: string): string {
  if (!text || typeof text !== 'string') {
    return text;
  }
  
  // Replace **text** with <b>text</b>
  // Using a regex that matches ** followed by any text (non-greedy) followed by **
  return text.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
}

/**
 * Renders text with HTML formatting safely
 * @param text - The text to render
 * @returns JSX element with dangerouslySetInnerHTML
 */
export function renderFormattedText(text: string) {
  const formattedText = convertMarkdownBold(text);
  return { __html: formattedText };
}
