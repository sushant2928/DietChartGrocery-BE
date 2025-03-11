import fs from 'fs';
import pdf from 'pdf-parse/lib/pdf-parse.js'

async function processPDF(pdfPath) {
    try {
        if (!pdfPath || pdfPath.length === 0) {
            throw new Error('Invalid PDF file');
        }

        // Parse PDF
        const data = await pdf(pdfPath);
        
        // Validate extracted text
        if (!data || !data?.text) {
            throw new Error('No text could be extracted from PDF');
        }

        // Get text content
        const text = data.text;
        
        // Log the extracted text for debugging
        console.log('Extracted text:', text);
        
        return text;
    } catch (error) {
        console.error('Error processing PDF:', error);
        throw error;
    } finally {
        // Optionally clean up the uploaded file
        // fs.unlinkSync(pdfPath);
    }
}

export default processPDF;