// Test script to verify inline editor functionality
import { DirectusServiceExtension } from './services/directusServiceExtension.js';

async function testInlineEditor() {
  console.log('🧪 Testing Universal Inline Editor...');
  
  try {
    // Test 1: Update hero collection with default values
    console.log('📝 Test 1: Updating hero collection...');
    const heroData = {
      categories_section_title: "Categorias Principais",
      categories_section_description: "Produtos e softwares selecionados para profissionais de diagnóstico.",
      services_title: "Serviços Especializados",
      services_description: "Soluções profissionais em eletrónica automóvel com mais de 10 anos de experiência. Oferecemos serviços de qualidade com garantia e suporte técnico especializado.",
      services_feature1_title: "Atendimento Rápido",
      services_feature1_description: "Diagnóstico e orçamento em 24h. Intervenções rápidas e eficientes.",
      services_feature2_title: "Garantia de Qualidade",
      services_feature2_description: "Todos os serviços incluem garantia e suporte técnico pós-venda.",
      services_feature3_title: "Experiência Comprovada",
      services_feature3_description: "Mais de 10 anos de experiência em eletrónica automóvel.",
      services_cta_title: "Precisa de um Orçamento?",
      services_cta_description: "Entre em contacto connosco para um orçamento personalizado. Analisamos o seu caso e apresentamos a melhor solução.",
      services_cta_button1: "Pedir Orçamento",
      services_cta_button2: "Saber Mais"
    };
    
    const result = await DirectusServiceExtension.updateCollectionItemSafe('hero', 1, heroData);
    console.log('✅ Hero collection updated successfully:', result);
    
    // Test 2: Verify the update by reading back
    console.log('📖 Test 2: Reading back hero collection...');
    const heroItem = await DirectusServiceExtension.getCollectionItemSafe('hero', 1);
    console.log('✅ Hero collection read successfully:', heroItem);
    
    // Test 3: Test individual field update
    console.log('📝 Test 3: Testing individual field update...');
    const fieldResult = await DirectusServiceExtension.updateField('hero', 1, 'categories_section_title', 'Categorias Principais - Atualizado');
    console.log('✅ Field updated successfully:', fieldResult);
    
    console.log('🎉 All tests passed! Universal Inline Editor is working correctly.');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
    throw error;
  }
}

// Run the test
testInlineEditor().catch(console.error);
