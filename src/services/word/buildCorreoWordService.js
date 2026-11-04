import { Document, Packer, Paragraph, TextRun } from 'docx';

/**
 * Construye y descarga el archivo .docx con el texto del correo institucional.
 */
export async function generarCorreoWord({ docenteInfo, programas, asignaciones }) {
  const nombreDocente = docenteInfo?.nombreCompleto || 'Docente';
  const correoDocente = docenteInfo?.correo || 'correo@ues.edu.sv';

  // 1. Extraer nombres únicos de programas seleccionados
  const nombresProgramas = [...new Set(programas.map((p) => p.nombre))].join(', ');

  // 2. Extraer asignaturas y verificar si hay coordinaciones
  const listaLabores = [];
  asignaciones.forEach((asig) => {
    if (asig.cargo?.toUpperCase().includes('COORDINAD')) {
      if (!listaLabores.includes('Coordinación')) listaLabores.push('Coordinación');
    } else if (asig.materia) {
      listaLabores.push(asig.materia);
    }
  });
  const textoLabores = listaLabores.join(', ') || 'Docencia modular';

  // 3. Determinar periodo global de ejecución
  let minDate = null;
  let maxDate = null;
  const MESES = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
  ];

  asignaciones.forEach((asig) => {
    if (asig.fechaInicio) {
      const dIni = new Date(asig.fechaInicio + 'T00:00:00');
      if (!minDate || dIni < minDate) minDate = dIni;
    }
    if (asig.fechaFin) {
      const dFin = new Date(asig.fechaFin + 'T00:00:00');
      if (!maxDate || dFin > maxDate) maxDate = dFin;
    }
  });

  let periodoTexto = '';
  if (minDate && maxDate) {
    periodoTexto = `${minDate.getDate()} de ${MESES[minDate.getMonth()]} al ${maxDate.getDate()} de ${MESES[maxDate.getMonth()]}`;
  }

  // 4. Estructuración del documento Word
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Asunto
          new Paragraph({
            children: [
              new TextRun({
                text: `Requerimiento de contratación – ${nombreDocente}`,
                bold: true,
                size: 22, // 11 pt
                font: 'Calibri'
              })
            ],
            spacing: { after: 300 }
          }),

          // Saludo
          new Paragraph({
            children: [
              new TextRun({ text: 'Estimada Lcda.', size: 22, font: 'Calibri' })
            ],
            spacing: { after: 200 }
          }),

          // Introducción
          new Paragraph({
            children: [
              new TextRun({ text: 'Espero que se encuentre muy bien.', size: 22, font: 'Calibri' })
            ],
            spacing: { after: 200 }
          }),

          // Cuerpo de la solicitud
          new Paragraph({
            children: [
              new TextRun({
                text: 'Por medio de la presente, solicito su amable apoyo con la elaboración de la solicitud de la siguiente contratación docente:',
                size: 22,
                font: 'Calibri'
              })
            ],
            spacing: { after: 180 }
          }),

          // Viñetas con la información consolidada
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Docente: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: nombreDocente, size: 22, font: 'Calibri' })
            ],
            spacing: { after: 80 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Correo Electrónico: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: correoDocente, size: 22, font: 'Calibri' })
            ],
            spacing: { after: 80 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Asignatura / Modulo: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: textoLabores, size: 22, font: 'Calibri' })
            ],
            spacing: { after: 80 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Programa: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: nombresProgramas, size: 22, font: 'Calibri' })
            ],
            spacing: { after: 80 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({ text: 'Periodo de ejecución: ', bold: true, size: 22, font: 'Calibri' }),
              new TextRun({ text: periodoTexto, size: 22, font: 'Calibri' })
            ],
            spacing: { after: 240 }
          }),

          // Párrafo de adjuntos
          new Paragraph({
            children: [
              new TextRun({
                text: 'Adjunto a este correo encontrará los documentos correspondientes:',
                size: 22,
                font: 'Calibri'
              })
            ],
            spacing: { after: 140 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: 'Requerimiento de contratación.', size: 22, font: 'Calibri' })],
            spacing: { after: 60 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: 'Atestados y documentación del docente.', size: 22, font: 'Calibri' })],
            spacing: { after: 60 }
          }),
          new Paragraph({
            bullet: { level: 0 },
            children: [new TextRun({ text: 'Solicitud y acuerdos de impartición', size: 22, font: 'Calibri' })],
            spacing: { after: 240 }
          }),

          // Nota de acuerdos previos
          new Paragraph({
            children: [
              new TextRun({
                text: 'Los documentos de solicitud y acuerdos de aprobación de impartición ya han sido enviados anteriormente, por lo que son omitidos.',
                size: 22,
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 }
          }),

          // Cierre
          new Paragraph({
            children: [
              new TextRun({
                text: 'Quedamos a la orden ante cualquier consulta o requerimiento adicional para dar seguimiento a este proceso.',
                size: 22,
                font: 'Calibri'
              })
            ],
            spacing: { after: 200 }
          }),

          // Saludo final
          new Paragraph({
            children: [
              new TextRun({ text: 'Saludos cordiales.', size: 22, font: 'Calibri' })
            ]
          })
        ]
      }
    ]
  });

  // 5. Descargar el archivo .docx generado
  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const sanitized = nombreDocente.replace(/[^a-zA-Z0-9_-]/g, '_');
  link.href = url;
  link.download = `Correo_Requerimiento_${sanitized}.docx`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}