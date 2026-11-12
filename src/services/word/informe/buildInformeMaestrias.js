import {
    Document,
    Table,
    TableRow,
    WidthType,
    AlignmentType,
    PageBreak,
    Paragraph
} from 'docx';
import {
    BORDERS_ALL,
    BORDERS_NONE,
    SHADING_HEADER,
    crearParrafo,
    crearCelda,
    crearFilaTituloSeccion,
    construirEncabezadoInstitucional,
    construirTablaDesempeno,
    construirBloqueFirma,
    descargarDocumentoWord
} from './wordInformeHelpers';

const TEXTOS_DEFAULT_MAESTRIA = {
    descripcion:
        'Preparación e impartición de clases, Diseño, supervisión y calificación de las evaluaciones de la asignatura, Comunicación de resultados a los estudiantes y al Coordinador Académico de la Maestría.',
    objetivos:
        'El objetivo principal fue facilitar el desarrollo de competencias de alto nivel y conocimientos especializados. Se buscó asegurar el cumplimiento de los objetivos de aprendizaje de la materia mediante múltiples evaluaciones y retroalimentación. Asimismo, se procuró mantener una comunicación fluida y un reporte eficiente con la coordinación del programa.',
    metodologia:
        'Se utilizó un enfoque interactivo adaptado al entorno virtual, combinando video clases sincrónicas con video tutoriales asincrónicos. El compromiso estudiantil se fomentó mediante foros de discusión y el uso de Tics. La metodología se complementó con cuestionarios de autoevaluación para el seguimiento, así como algunas actividades que requirieron presencialidad si era indicado en la ruta de aprendizaje.',
    herramientas:
        'La plataforma virtual institucional fue el recurso central para la administración del curso y la distribución de material digital. Se emplearon herramientas de videoconferencia e Internet para las clases magistrales. Adicionalmente, se utilizaron recursos físicos como computadora y pantalla de proyección, para optimizar las transmisiones sincrónicas.'
};

const DIAS_CORTO = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const MESES_CORTO = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DIAS_SEMANA_ORDEN = [
    { id: 1, nombre: 'Lunes' },
    { id: 2, nombre: 'Martes' },
    { id: 3, nombre: 'Miércoles' },
    { id: 4, nombre: 'Jueves' },
    { id: 5, nombre: 'Viernes' },
    { id: 6, nombre: 'Sábados' },
    { id: 0, nombre: 'Domingos' }
];

const formatTime12hAmPm = (timeStr) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 || 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${ampm}`;
};

/**
 * Genera y descarga el Informe de Actividades + Anexo 1 para Docente de Maestría
 */
export async function generarInformeMaestriasWord({
    datosInforme,
    asignaciones = [],
    sesiones = [],
    logoBuffer = null
}) {
    const sesionesActivas = sesiones
        .filter((s) => s.activa)
        .sort((a, b) => a.fecha.localeCompare(b.fecha));

    const totalHoras = sesionesActivas.reduce((acc, s) => acc + s.duracionHoras, 0);

    // 1. Encabezado Institucional
    const encabezado = construirEncabezadoInstitucional({
        refInforme: datosInforme.refInforme || 'EP-0000-2026',
        fechaEmision: datosInforme.fechaEmision || '',
        periodoTexto: datosInforme.periodoTexto || '',
        logoBuffer
    });

    // 2. Sección 1: Datos Generales
    const tablaDatosGenerales = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            crearFilaTituloSeccion('1. DATOS GENERALES', 2),
            new TableRow({
                children: [
                    crearCelda(
                        [
                            crearParrafo('MSc. Elmer Arturo Carballo Ruiz', { bold: true, size: 20, spaceAfter: 10 }),
                            crearParrafo('Director', { size: 20, spaceAfter: 10 }),
                            crearParrafo('Escuela de Posgrado', { size: 20, spaceAfter: 0 })
                        ],
                        { widthPct: 45 }
                    ),
                    crearCelda(
                        [
                            crearParrafo(`Ref. Solicitud: ${datosInforme.refSolicitud || 'EP-0000-2026'}`, {
                                bold: true,
                                size: 20,
                                spaceAfter: datosInforme.acuerdoJD ? 20 : 0
                            }),
                            ...(datosInforme.acuerdoJD
                                ? [crearParrafo(`Acuerdo JD: ${datosInforme.acuerdoJD}`, { bold: true, size: 20, spaceAfter: 0 })]
                                : [])
                        ],
                        { widthPct: 55 }
                    )
                ]
            }),
            new TableRow({
                children: [
                    crearCelda(crearParrafo('Nombre del Docente:', { bold: true, size: 20, spaceAfter: 0 }), { widthPct: 45 }),
                    crearCelda(crearParrafo(datosInforme.docenteNombre || '', { size: 20, spaceAfter: 0 }), { widthPct: 55 })
                ]
            }),
            new TableRow({
                children: [
                    crearCelda(crearParrafo('Modalidad de desarrollo de las clases:', { bold: true, size: 20, spaceAfter: 0 })),
                    crearCelda(crearParrafo(datosInforme.modalidadClases || 'Semipresencial', { size: 20, spaceAfter: 0 }))
                ]
            }),
            new TableRow({
                children: [
                    crearCelda(crearParrafo('Modalidad de contratación:', { bold: true, size: 20, spaceAfter: 0 })),
                    crearCelda(
                        crearParrafo(datosInforme.modalidadContratacion || 'Servicios Profesionales no Personales', {
                            size: 20,
                            spaceAfter: 0
                        })
                    )
                ]
            }),
            new TableRow({
                children: [
                    crearCelda(crearParrafo('Total de horas:', { bold: true, size: 20, spaceAfter: 0 })),
                    crearCelda(crearParrafo(`${totalHoras} horas`, { bold: true, size: 20, spaceAfter: 0 }))
                ]
            })
        ]
    });

    // 3. Sección 2: Carga Académica (construye horarios agrupados por asignación)
    const filasCarga = [
        crearFilaTituloSeccion('2. CARGA ACADÉMICA', 5),
        new TableRow({
            children: [
                crearCelda(crearParrafo('ASIGNATURA / COORDINACIÓN', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 32, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('GRUPO', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 10, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('DÍAS', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 18, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('HORARIO', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 24, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('ESTUDIANTES ATENDIDOS', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 16, shading: SHADING_HEADER })
            ]
        })
    ];

    const horariosResumenDerecha = [];

    asignaciones.forEach((asig) => {
        const lineasHorarios = [];
        DIAS_SEMANA_ORDEN.forEach((d) => {
            if (asig.dias[d.id]?.activo) {
                const rango = `${formatTime12hAmPm(asig.dias[d.id].horaInicio)} a ${formatTime12hAmPm(asig.dias[d.id].horaFin)}`;
                lineasHorarios.push({ dia: d.nombre, horario: rango });
                horariosResumenDerecha.push({ dia: d.nombre, horario: rango });
            }
        });

        if (lineasHorarios.length === 0) {
            lineasHorarios.push({ dia: '--', horario: '--' });
        }

        lineasHorarios.forEach((item, idx) => {
            filasCarga.push(
                new TableRow({
                    children: [
                        ...(idx === 0
                            ? [
                                crearCelda(crearParrafo(asig.materia, { bold: true, size: 19, spaceAfter: 0 }), {
                                    rowSpan: lineasHorarios.length
                                }),
                                crearCelda(crearParrafo('--', { size: 19, align: AlignmentType.CENTER, spaceAfter: 0 }), {
                                    rowSpan: lineasHorarios.length
                                })
                            ]
                            : []),
                        crearCelda(crearParrafo(item.dia, { size: 19, align: AlignmentType.CENTER, spaceAfter: 0 })),
                        crearCelda(crearParrafo(item.horario, { size: 19, align: AlignmentType.CENTER, spaceAfter: 0 })),
                        ...(idx === 0
                            ? [
                                crearCelda(
                                    crearParrafo(String(datosInforme.estudiantesAtendidos || '0'), {
                                        size: 19,
                                        align: AlignmentType.CENTER,
                                        spaceAfter: 0
                                    }),
                                    { rowSpan: lineasHorarios.length }
                                )
                            ]
                            : [])
                    ]
                })
            );
        });
    });

    const tablaCargaAcademica = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: filasCarga
    });

    // 4. Sección 3: Actividades y Desempeño Docente
    const textos = {
        descripcion: datosInforme.descripcion || TEXTOS_DEFAULT_MAESTRIA.descripcion,
        objetivos: datosInforme.objetivos || TEXTOS_DEFAULT_MAESTRIA.objetivos,
        metodologia: datosInforme.metodologia || TEXTOS_DEFAULT_MAESTRIA.metodologia,
        herramientas: datosInforme.herramientas || TEXTOS_DEFAULT_MAESTRIA.herramientas
    };

    const tablaActividades = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            crearFilaTituloSeccion('3. ACTIVIDADES Y DESEMPEÑO DOCENTE', 1),
            new TableRow({
                children: [
                    crearCelda([
                        crearParrafo('Descripción de la Actividad:', { bold: true, size: 19, spaceAfter: 20 }),
                        crearParrafo(textos.descripcion, { size: 19, spaceAfter: 60 }),
                        crearParrafo('Objetivos:', { bold: true, size: 19, spaceAfter: 20 }),
                        crearParrafo(textos.objetivos, { size: 19, spaceAfter: 60 }),
                        crearParrafo('Metodología:', { bold: true, size: 19, spaceAfter: 20 }),
                        crearParrafo(textos.metodologia, { size: 19, spaceAfter: 60 }),
                        crearParrafo('Herramientas o recursos utilizados:', { bold: true, size: 19, spaceAfter: 20 }),
                        crearParrafo(textos.herramientas, { size: 19, spaceAfter: 10 })
                    ])
                ]
            })
        ]
    });

    // 5. Sección 4: Resultados y Logros
    const tablaResultados = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            crearFilaTituloSeccion('4. RESULTADOS Y LOGROS', 1),
            new TableRow({
                children: [
                    crearCelda([
                        crearParrafo('Dato cualitativo:', { bold: true, size: 19, spaceAfter: 20 }),
                        crearParrafo(`Carreras: ${datosInforme.programaNombre || ''} ${datosInforme.cohorte || ''}`.trim(), { size: 19, spaceAfter: 10 }),
                        crearParrafo(`Ciclo de acuerdo a pensum: ${datosInforme.cicloPensum || 'Ciclo II'}`, { size: 19, spaceAfter: 50 }),
                        crearParrafo('Dato cuantitativo:', { bold: true, size: 19, spaceAfter: 20 }),
                        crearParrafo(`Cantidad de alumnos atendidos: ${datosInforme.estudiantesAtendidos || '0'}`, { size: 19, spaceAfter: 10 })
                    ])
                ]
            })
        ]
    });

    // 6. Sección 5: Dificultades y Áreas de Mejora
    const tablaDificultades = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
            crearFilaTituloSeccion('5. DIFICULTADES Y AREAS DE MEJORA', 1),
            new TableRow({
                children: [
                    crearCelda(crearParrafo(datosInforme.dificultades || 'Ninguna.', { size: 19, spaceAfter: 20 }))
                ]
            })
        ]
    });

    // 7. Sección 6: Nivel de Desempeño
    const tablaDesempeno = construirTablaDesempeno({
        nivelSeleccionado: datosInforme.nivelDesempeno || 'Excelente',
        comentarios: datosInforme.comentariosDesempeno || ''
    });

    // 8. ANEXO 1: Calendario de Labores (Nueva página)
    const filasAnexo = [
        new TableRow({
            children: [
                crearCelda(crearParrafo('DÍA', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 10, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('FECHA', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 12, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('No. HORAS', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 14, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('MES', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 12, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('', { spaceAfter: 0 }), { widthPct: 6, borders: BORDERS_NONE }),
                crearCelda(crearParrafo('Día', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 18, shading: SHADING_HEADER }),
                crearCelda(crearParrafo('Horario', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { widthPct: 28, shading: SHADING_HEADER })
            ]
        })
    ];

    const totalFilasAnexo = Math.max(sesionesActivas.length + 1, horariosResumenDerecha.length);

    for (let i = 0; i < totalFilasAnexo; i++) {
        const sesion = sesionesActivas[i];
        const esFilaTotal = i === sesionesActivas.length;
        const horarioDer = horariosResumenDerecha[i];

        // Celdas bloque izquierdo (Sesiones o Total)
        let celdasIzq;
        if (sesion) {
            const [y, m, d] = sesion.fecha.split('-').map(Number);
            const dt = new Date(y, m - 1, d);
            celdasIzq = [
                crearCelda(crearParrafo(DIAS_CORTO[dt.getDay()], { size: 18, align: AlignmentType.CENTER, spaceAfter: 0 })),
                crearCelda(crearParrafo(String(d).padStart(2, '0'), { size: 18, align: AlignmentType.CENTER, spaceAfter: 0 })),
                crearCelda(crearParrafo(String(sesion.duracionHoras), { size: 18, align: AlignmentType.CENTER, spaceAfter: 0 })),
                crearCelda(crearParrafo(MESES_CORTO[m - 1], { size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }))
            ];
        } else if (esFilaTotal) {
            celdasIzq = [
                crearCelda(crearParrafo('Total', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { columnSpan: 2, shading: SHADING_HEADER }),
                crearCelda(crearParrafo(String(totalHoras), { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { shading: SHADING_HEADER }),
                crearCelda(crearParrafo('Horas', { bold: true, size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }), { shading: SHADING_HEADER })
            ];
        } else {
            celdasIzq = [
                crearCelda(crearParrafo('', { spaceAfter: 0 }), { columnSpan: 4, borders: BORDERS_NONE })
            ];
        }

        // Celdas bloque derecho (Horario semanal)
        const celdasDer = horarioDer
            ? [
                crearCelda(crearParrafo(horarioDer.dia, { size: 18, align: AlignmentType.CENTER, spaceAfter: 0 })),
                crearCelda(crearParrafo(horarioDer.horario, { size: 18, align: AlignmentType.CENTER, spaceAfter: 0 }))
            ]
            : [
                crearCelda(crearParrafo('', { spaceAfter: 0 }), { borders: BORDERS_NONE }),
                crearCelda(crearParrafo('', { spaceAfter: 0 }), { borders: BORDERS_NONE })
            ];

        filasAnexo.push(
            new TableRow({
                children: [
                    ...celdasIzq,
                    crearCelda(crearParrafo('', { spaceAfter: 0 }), { borders: BORDERS_NONE }),
                    ...celdasDer
                ]
            })
        );
    }

    const tablaAnexo1 = new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: filasAnexo
    });

    // Construcción final del documento
    const doc = new Document({
        sections: [
            {
                properties: {
                    page: {
                        margin: { top: 720, bottom: 720, left: 850, right: 850 } // Márgenes compactos para ajuste en página
                    }
                },
                children: [
                    encabezado,
                    new Paragraph({ spacing: { after: 100 }, children: [] }),
                    tablaDatosGenerales,
                    new Paragraph({ spacing: { after: 80 }, children: [] }),
                    tablaCargaAcademica,
                    new Paragraph({ spacing: { after: 80 }, children: [] }),
                    tablaActividades,
                    new Paragraph({ spacing: { after: 80 }, children: [] }),
                    tablaResultados,
                    new Paragraph({ spacing: { after: 80 }, children: [] }),
                    tablaDificultades,
                    new Paragraph({ spacing: { after: 80 }, children: [] }),
                    tablaDesempeno,
                    new Paragraph({ spacing: { before: 120, after: 40 }, children: [] }),
                    crearParrafo('Se adjunta, además:', { bold: true, size: 19, spaceAfter: 20 }),
                    crearParrafo('Anexo 1: Detalle de horario', { size: 19, spaceAfter: 10 }),
                    crearParrafo('Anexo 2: Colector de notas', { size: 19, spaceAfter: 0 }),

                    // Salto de página hacia Anexo 1
                    new Paragraph({ children: [new PageBreak()] }),
                    crearParrafo('ANEXO 1', { bold: true, size: 22, align: AlignmentType.CENTER, spaceAfter: 20 }),
                    crearParrafo('CALENDARIO DE LABORES', { bold: true, size: 22, align: AlignmentType.CENTER, spaceAfter: 160 }),
                    tablaAnexo1,
                    ...construirBloqueFirma()
                ]
            }
        ]
    });

    const nombreLimpio = (datosInforme.docenteNombre || 'Docente').replace(/[^a-zA-Z0-9_-]/g, '_');
    await descargarDocumentoWord(doc, `Informe_Actividades_Maestria_${nombreLimpio}.docx`);
}