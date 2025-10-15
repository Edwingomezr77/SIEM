import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Remision, PiezaEmbarcada, PreembarqueInfo, RemisionImage } from '../types/database';

export class PDFService {
  // Función auxiliar para corregir la orientación de la imagen basada en EXIF
  private static async correctImageOrientation(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        // Crear canvas para corregir orientación
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          resolve(imageUrl);
          return;
        }

        // Establecer dimensiones del canvas igual a la imagen
        canvas.width = img.width;
        canvas.height = img.height;

        // Dibujar la imagen en el canvas (esto corrige automáticamente la orientación EXIF)
        ctx.drawImage(img, 0, 0);

        // Convertir canvas a data URL
        resolve(canvas.toDataURL('image/jpeg', 0.95));
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = imageUrl;
    });
  }

  static async generatePreembarqueReport(
    remision: Remision,
    piezas: PiezaEmbarcada[],
    preembarqueInfo: PreembarqueInfo | null,
    images: RemisionImage[]
  ): Promise<void> {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Configurar fuentes
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);

    // Título del reporte
    pdf.text('REPORTE DE PRE-EMBARQUE', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    // Línea separadora
    pdf.setLineWidth(0.5);
    pdf.line(20, yPosition, pageWidth - 20, yPosition);
    yPosition += 10;

    // Información de la remisión
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('INFORMACIÓN GENERAL', 20, yPosition);
    yPosition += 8;

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    
    const generalInfo = [
      `Número de Remisión: ${remision.numero_remision}`,
      `Proyecto/Cliente: ${remision.cliente || 'No especificado'}`,
      `Estado: ${remision.estado?.toUpperCase() || 'PENDIENTE'}`,
      `Fecha de Creación: ${new Date(remision.fecha_creacion).toLocaleDateString('es-ES')}`,
      `Total de Piezas: ${remision.total_piezas || 0}`,
      `Observaciones: ${remision.observaciones || 'Ninguna'}`
    ];

    generalInfo.forEach(info => {
      pdf.text(info, 20, yPosition);
      yPosition += 6;
    });

    yPosition += 5;

    // Información del pre-embarque
    if (preembarqueInfo) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('INFORMACIÓN DEL PRE-EMBARQUE', 20, yPosition);
      yPosition += 8;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);

      const preembarqueData = [
        `Supervisor de Obra: ${preembarqueInfo.supervisor_obra || 'No especificado'}`,
        `Operador: ${preembarqueInfo.operador || 'No especificado'}`,
        `Teléfono: ${preembarqueInfo.telefono || 'No especificado'}`,
        `Placas del Camión: ${preembarqueInfo.placas_camion || 'No especificado'}`,
        `Transportista: ${preembarqueInfo.transportista || 'No especificado'}`,
        `Barrotes: ${preembarqueInfo.barrotes || 'No especificado'}`
      ];

      preembarqueData.forEach(info => {
        pdf.text(info, 20, yPosition);
        yPosition += 6;
      });

      yPosition += 5;
    }

    // Verificar si necesitamos nueva página
    if (yPosition > pageHeight - 60) {
      pdf.addPage();
      yPosition = 20;
    }

    // Tabla de piezas
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.text('DETALLE DE PIEZAS EMBARCADAS', 20, yPosition);
    yPosition += 10;

    if (piezas.length > 0) {
      // Encabezados de la tabla
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.text('No.', 20, yPosition);
      pdf.text('Marca', 35, yPosition);
      pdf.text('Cantidad', 120, yPosition);
      pdf.text('Folio', 150, yPosition);
      pdf.text('Fecha/Hora', 180, yPosition);
      
      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 5;

      // Datos de las piezas
      pdf.setFont('helvetica', 'normal');
      piezas.forEach((pieza, index) => {
        if (yPosition > pageHeight - 20) {
          pdf.addPage();
          yPosition = 20;
          
          // Repetir encabezados en nueva página
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text('No.', 20, yPosition);
          pdf.text('Marca', 35, yPosition);
          pdf.text('Cantidad', 120, yPosition);
          pdf.text('Folio', 150, yPosition);
          pdf.text('Fecha/Hora', 180, yPosition);
          yPosition += 5;
          pdf.line(20, yPosition, pageWidth - 20, yPosition);
          yPosition += 5;
          pdf.setFont('helvetica', 'normal');
        }

        pdf.text((index + 1).toString(), 20, yPosition);
        pdf.text(pieza.marca, 35, yPosition);
        pdf.text(pieza.cantidad.toString(), 120, yPosition);
        pdf.text(pieza.folio || 'N/A', 150, yPosition);
        pdf.text(
          new Date(pieza.timestamp_registro).toLocaleString('es-ES'),
          180, 
          yPosition
        );
        yPosition += 5;
      });

      yPosition += 5;
      pdf.line(20, yPosition, pageWidth - 20, yPosition);
      yPosition += 10;

      // Resumen
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(12);
      pdf.text(`TOTAL DE PIEZAS: ${piezas.length}`, 20, yPosition);
    } else {
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text('No hay piezas registradas en este pre-embarque.', 20, yPosition);
    }

    yPosition += 15;

    // Información de imágenes
    if (images.length > 0) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.text('IMÁGENES DEL PRE-EMBARQUE', 20, yPosition);
      yPosition += 10;

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(10);
      pdf.text(`Total de imágenes: ${images.length}`, 20, yPosition);
      yPosition += 10;

      for (let i = 0; i < images.length; i++) {
        const image = images[i];

        try {
          // Corregir la orientación de la imagen
          const correctedImageUrl = await this.correctImageOrientation(image.image_url);

          // Crear elemento img temporal para cargar la imagen corregida
          const img = new Image();
          img.crossOrigin = 'anonymous';

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = reject;
            img.src = correctedImageUrl;
          });

          // Calcular dimensiones para ajustar a la página
          const maxWidth = pageWidth - 40;
          const maxHeight = 100;

          let imgWidth = img.width;
          let imgHeight = img.height;

          // Escalar imagen si es necesario
          if (imgWidth > maxWidth) {
            imgHeight = (imgHeight * maxWidth) / imgWidth;
            imgWidth = maxWidth;
          }

          if (imgHeight > maxHeight) {
            imgWidth = (imgWidth * maxHeight) / imgHeight;
            imgHeight = maxHeight;
          }

          // Verificar si necesitamos nueva página
          if (yPosition + imgHeight + 25 > pageHeight) {
            pdf.addPage();
            yPosition = 20;
          }

          // Agregar imagen al PDF
          pdf.addImage(correctedImageUrl, 'JPEG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 5;

          // Agregar información de la imagen
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text(`Imagen ${i + 1}: ${image.image_name}`, 20, yPosition);
          yPosition += 4;

          if (image.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`Descripción: ${image.description}`, 20, yPosition);
            yPosition += 4;
          }

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(`Fecha: ${new Date(image.created_at).toLocaleString('es-ES')}`, 20, yPosition);
          yPosition += 10;

        } catch (error) {
          console.error('Error loading image:', error);
          // Si no se puede cargar la imagen, solo mostrar la información
          pdf.setFont('helvetica', 'bold');
          pdf.setFontSize(9);
          pdf.text(`Imagen ${i + 1}: ${image.image_name} (No se pudo cargar)`, 20, yPosition);
          yPosition += 4;

          if (image.description) {
            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(8);
            pdf.text(`Descripción: ${image.description}`, 20, yPosition);
            yPosition += 4;
          }

          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(8);
          pdf.text(`Fecha: ${new Date(image.created_at).toLocaleString('es-ES')}`, 20, yPosition);
          yPosition += 8;
        }
      }
    }

    // Pie de página
    const currentDate = new Date().toLocaleString('es-ES');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.text(
      `Reporte generado el ${currentDate}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: 'center' }
    );

    // Descargar el PDF
    const fileName = `Pre-embarque_${remision.numero_remision}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }

  static async generateImageReport(
    remision: Remision,
    images: RemisionImage[]
  ): Promise<void> {
    if (images.length === 0) {
      alert('No hay imágenes para incluir en el reporte');
      return;
    }

    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Título
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(`REPORTE DE IMÁGENES - ${remision.numero_remision}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    for (let i = 0; i < images.length; i++) {
      const image = images[i];

      try {
        // Corregir la orientación de la imagen
        const correctedImageUrl = await this.correctImageOrientation(image.image_url);

        // Crear elemento img temporal para cargar la imagen corregida
        const img = new Image();
        img.crossOrigin = 'anonymous';

        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = correctedImageUrl;
        });

        // Calcular dimensiones para ajustar a la página
        const maxWidth = pageWidth - 40;
        const maxHeight = 120;

        let imgWidth = img.width;
        let imgHeight = img.height;

        // Escalar imagen si es necesario
        if (imgWidth > maxWidth) {
          imgHeight = (imgHeight * maxWidth) / imgWidth;
          imgWidth = maxWidth;
        }

        if (imgHeight > maxHeight) {
          imgWidth = (imgWidth * maxHeight) / imgHeight;
          imgHeight = maxHeight;
        }

        // Verificar si necesitamos nueva página
        if (yPosition + imgHeight + 30 > pageHeight) {
          pdf.addPage();
          yPosition = 20;
        }

        // Agregar imagen al PDF
        pdf.addImage(correctedImageUrl, 'JPEG', 20, yPosition, imgWidth, imgHeight);
        yPosition += imgHeight + 5;

        // Agregar información de la imagen
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(`Imagen ${i + 1}: ${image.image_name}`, 20, yPosition);
        yPosition += 5;

        if (image.description) {
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Descripción: ${image.description}`, 20, yPosition);
          yPosition += 5;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`Fecha: ${new Date(image.created_at).toLocaleString('es-ES')}`, 20, yPosition);
        yPosition += 15;

      } catch (error) {
        console.error('Error loading image:', error);
        // Si no se puede cargar la imagen, solo mostrar la información
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.text(`Imagen ${i + 1}: ${image.image_name} (No se pudo cargar)`, 20, yPosition);
        yPosition += 5;

        if (image.description) {
          pdf.setFont('helvetica', 'normal');
          pdf.text(`Descripción: ${image.description}`, 20, yPosition);
          yPosition += 5;
        }

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.text(`Fecha: ${new Date(image.created_at).toLocaleString('es-ES')}`, 20, yPosition);
        yPosition += 10;
      }
    }

    // Descargar el PDF
    const fileName = `Imagenes_${remision.numero_remision}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  }
}