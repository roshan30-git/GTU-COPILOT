import React, { useState } from 'react';
import { generateCaseStudyReport } from '../services/geminiService';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Document, Packer, Paragraph, TextRun, AlignmentType, Table, TableRow, TableCell, BorderStyle, WidthType, VerticalAlign, PageNumber, Header, Footer } from 'docx';
import saveAs from 'file-saver';

const sanitizeText = (text: string) => {
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
};

export const CaseStudyGenerator: React.FC = () => {
  const [collegeName, setCollegeName] = useState('');
  const [department, setDepartment] = useState('');
  const [studentName, setStudentName] = useState('');
  const [enrolmentNumber, setEnrolmentNumber] = useState('');
  const [studentClass, setStudentClass] = useState('');
  const [subject, setSubject] = useState('');
  const [templateType, setTemplateType] = useState('Case Study');
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [topics, setTopics] = useState<string[]>(['']);
  const [reportData, setReportData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState('');

  const addTopic = () => {
    setTopics([...topics, '']);
  };

  const removeTopic = (index: number) => {
    setTopics(topics.filter((_, i) => i !== index));
  };

  const updateTopic = (index: number, value: string) => {
    const newTopics = [...topics];
    newTopics[index] = value;
    setTopics(newTopics);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!collegeName || !department || !studentName || !enrolmentNumber || !subject || topics.some(t => !t.trim())) {
      setError('Please fill in all fields and ensure all topics have text.');
      return;
    }
    setError('');
    setIsLoading(true);
    setReportData(null);

    try {
      const result = await generateCaseStudyReport(studentName, enrolmentNumber, studentClass, subject, topics, collegeName, department, templateType);
      setReportData(result);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!reportData) return;
    setIsDownloading(true);

    try {
      const docChildren: any[] = [];

      // --- PAGE 1: COVER PAGE ---
      docChildren.push(
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 200, after: 100 },
          children: [
            new TextRun({ text: reportData.institution, color: "1A3668", bold: true, size: 28, font: "Arial" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          children: [
            new TextRun({ text: "INSTITUTE OF TECHNOLOGY", color: "1A3668", bold: true, size: 28, font: "Arial" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 },
          children: [
            new TextRun({ text: reportData.department, color: "1A3668", bold: true, size: 24, font: "Arial" })
          ]
        }),
        new Paragraph({
          border: { bottom: { color: "1A3668", space: 1, style: BorderStyle.SINGLE, size: 12 } },
          children: []
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 800, after: 200 },
          children: [
            new TextRun({ text: reportData.subject, color: "2B579A", bold: true, size: 32, font: "Arial" })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 800 },
          border: { bottom: { color: "1A3668", space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: []
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 1200 },
          children: [
            new TextRun({ text: reportData.reportType, color: "2B579A", size: 28, font: "Arial" })
          ]
        })
      );

      // Student Info Table
      docChildren.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "auto" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
            left: { style: BorderStyle.NONE, size: 0, color: "auto" },
            right: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
          },
          rows: [
            new TableRow({ children: [
              new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Student Name", bold: true, size: 24, font: "Arial" })] })] }),
              new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `: ${reportData.studentName}`, size: 24, font: "Arial" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Enrolment Number", bold: true, size: 24, font: "Arial" })] })] }),
              new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `: ${reportData.enrolmentNumber}`, size: 24, font: "Arial" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ width: { size: 40, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: "Class", bold: true, size: 24, font: "Arial" })] })] }),
              new TableCell({ width: { size: 60, type: WidthType.PERCENTAGE }, children: [new Paragraph({ children: [new TextRun({ text: `: ${reportData.class}`, size: 24, font: "Arial" })] })] })
            ]})
          ]
        })
      );

      docChildren.push(
        new Paragraph({
          spacing: { before: 400, after: 400 },
          border: { bottom: { color: "D9D9D9", space: 1, style: BorderStyle.SINGLE, size: 6 } },
          children: []
        })
      );

      // Topics List
      reportData.caseStudies.forEach((cs: any, idx: number) => {
        docChildren.push(
          new Paragraph({
            spacing: { after: 100 },
            children: [
              new TextRun({ text: `Topic-${idx + 1}: `, color: "1A3668", bold: true, size: 24, font: "Arial" }),
              new TextRun({ text: cs.topicTitle, color: "2B579A", bold: true, size: 24, font: "Arial" })
            ]
          })
        );
      });

      // --- SUBSEQUENT PAGES: TOPICS ---
      reportData.caseStudies.forEach((cs: any, idx: number) => {
        docChildren.push(new Paragraph({ pageBreakBefore: true }));

        // Topic Header
        docChildren.push(
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    shading: { fill: "1A3668" },
                    margins: { top: 200, bottom: 200, left: 200, right: 200 },
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `Topic ${idx + 1}: ${cs.topicTitle}`, color: "FFFFFF", bold: true, size: 28, font: "Arial" })
                        ]
                      })
                    ]
                  })
                ]
              })
            ]
          }),
          new Paragraph({ spacing: { after: 200 } })
        );

        // Sections
        const addSection = (title: string, content: string, isBoxed: boolean = false) => {
          if (!content) return;
          docChildren.push(
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              borders: {
                top: { style: BorderStyle.NONE, size: 0, color: "auto" },
                bottom: { style: BorderStyle.NONE, size: 0, color: "auto" },
                left: { style: BorderStyle.NONE, size: 0, color: "auto" },
                right: { style: BorderStyle.NONE, size: 0, color: "auto" },
                insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "auto" },
                insideVertical: { style: BorderStyle.NONE, size: 0, color: "auto" },
              },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      shading: { fill: "E8F0FE" },
                      margins: { top: 100, bottom: 100, left: 150, right: 150 },
                      children: [
                        new Paragraph({
                          children: [new TextRun({ text: title, color: "1A3668", bold: true, size: 24, font: "Arial" })]
                        })
                      ]
                    })
                  ]
                })
              ]
            }),
            new Paragraph({ spacing: { after: 150 } })
          );

          if (isBoxed) {
            docChildren.push(
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
                  bottom: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
                  left: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
                  right: { style: BorderStyle.SINGLE, size: 4, color: "D9D9D9" },
                },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        margins: { top: 150, bottom: 150, left: 150, right: 150 },
                        children: [
                          new Paragraph({
                            children: [new TextRun({ text: content, italics: true, size: 22, font: "Courier New" })]
                          })
                        ]
                      })
                    ]
                  })
                ]
              }),
              new Paragraph({ spacing: { after: 200 } })
            );
          } else {
            docChildren.push(
              new Paragraph({
                spacing: { after: 200 },
                alignment: AlignmentType.JUSTIFIED,
                children: [new TextRun({ text: content, size: 22, font: "Arial" })]
              })
            );
          }
        };

        if (templateType === 'Lab Report') {
          addSection(`${idx + 1}.1 Aim`, cs.aim);
          addSection(`${idx + 1}.2 Apparatus/Tools`, cs.apparatus);
          addSection(`${idx + 1}.3 Theory`, cs.theory);
          addSection(`${idx + 1}.4 Procedure`, cs.procedure);
          addSection(`${idx + 1}.5 Observations/Results`, cs.observations);
        } else if (templateType === 'Technical Review') {
          addSection(`${idx + 1}.1 Abstract`, cs.abstract);
          addSection(`${idx + 1}.2 Literature Review`, cs.literatureReview);
          addSection(`${idx + 1}.3 Technical Analysis`, cs.technicalAnalysis);
          addSection(`${idx + 1}.4 Comparison`, cs.comparison);
          addSection(`${idx + 1}.5 Future Scope`, cs.futureScope);
        } else if (templateType === 'Project Proposal') {
          addSection(`${idx + 1}.1 Problem Statement`, cs.problemStatement);
          addSection(`${idx + 1}.2 Proposed Solution`, cs.proposedSolution);
          addSection(`${idx + 1}.3 Methodology`, cs.methodology);
          addSection(`${idx + 1}.4 Resource Requirements`, cs.resourceRequirements);
          addSection(`${idx + 1}.5 Expected Impact`, cs.expectedImpact);
        } else {
          addSection(`${idx + 1}.1 Introduction`, cs.introduction);
          addSection(`${idx + 1}.2 Scenario`, cs.scenario);
          addSection(`${idx + 1}.3 Prompt Given to AI`, cs.promptGiven, true);
          addSection(`${idx + 1}.4 Output Generated by AI`, cs.aiOutput);
          addSection(`${idx + 1}.5 Analysis of the Output`, cs.analysis);

          // Limitations as bullets
          if (cs.limitations && cs.limitations.length > 0) {
            docChildren.push(
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({
                          shading: { fill: "E8F0FE" },
                          margins: { top: 100, bottom: 100, left: 150, right: 150 },
                          children: [
                            new Paragraph({
                              children: [new TextRun({ text: `${idx + 1}.6 Limitations`, color: "1A3668", bold: true, size: 24, font: "Arial" })]
                            })
                          ]
                        })
                      ]
                    })
                  ]
                }),
                new Paragraph({ spacing: { after: 150 } })
            );
            cs.limitations.forEach((lim: string) => {
                docChildren.push(
                    new Paragraph({
                        bullet: { level: 0 },
                        spacing: { after: 100 },
                        children: [new TextRun({ text: lim, size: 22, font: "Arial" })]
                    })
                );
            });
            docChildren.push(new Paragraph({ spacing: { after: 150 } }));
          }
        }

        addSection(`${templateType === 'Case Study' ? `${idx + 1}.7` : `${idx + 1}.6`} Conclusion`, cs.conclusion);
      });

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: { top: 1000, right: 1000, bottom: 1000, left: 1000 },
            },
          },
          headers: {
            default: new Header({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.CENTER,
                        children: [new TextRun({ text: reportData.institution, color: "D9D9D9", size: 16, font: "Arial" })]
                    })
                ]
            })
          },
          footers: {
            default: new Footer({
                children: [
                    new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [
                            new TextRun({ text: "Page ", size: 18, font: "Arial" }),
                            new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Arial" })
                        ]
                    })
                ]
            })
          },
          children: docChildren
        }]
      });

      const blob = await Packer.toBlob(doc);
      saveAs(blob, `${studentName.replace(/\s+/g, '_')}_Case_Study_Report.docx`);
    } catch (e) {
      console.error("Error creating docx", e);
      alert("Failed to create document file.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Input Card */}
      <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 p-8 md:p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group transition-colors duration-500">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
        
        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-3 flex items-center gap-4 tracking-tight">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-2xl p-3 shadow-lg shadow-blue-500/20">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                Case Study Generator
              </h2>
              <p className="text-slate-400 font-medium text-lg ml-1">Generate professional academic activity reports in seconds.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 group/input md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Institution / College Name</label>
              <input 
                type="text" 
                value={collegeName} 
                onChange={e => setCollegeName(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium" 
                placeholder="e.g. SHREE SWAMI ATMANAND SARASWATI INSTITUTE OF TECHNOLOGY" 
              />
            </div>

            <div className="space-y-2 group/input md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Department</label>
              <input 
                type="text" 
                value={department} 
                onChange={e => setDepartment(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium" 
                placeholder="e.g. COMPUTER ENGINEERING DEPARTMENT" 
              />
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Student Name</label>
              <input 
                type="text" 
                value={studentName} 
                onChange={e => setStudentName(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium" 
                placeholder="e.g. John Doe" 
              />
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Enrolment Number</label>
              <input 
                type="text" 
                value={enrolmentNumber} 
                onChange={e => setEnrolmentNumber(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium" 
                placeholder="e.g. 250760107074" 
              />
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Class / Semester</label>
              <input 
                type="text" 
                value={studentClass} 
                onChange={e => setStudentClass(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium" 
                placeholder="e.g. 1st Year | Sem 2 | Div 12" 
              />
            </div>

            <div className="space-y-2 group/input">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Subject</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)} 
                className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none font-medium" 
                placeholder="e.g. Fundamental of AI [BE02R00041]" 
              />
            </div>

            <div className="space-y-2 group/input md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Select Report Template</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {['Case Study', 'Lab Report', 'Technical Review', 'Project Proposal'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTemplateType(type)}
                    className={`p-3 rounded-xl border-2 transition-all font-bold text-sm ${
                      templateType === type 
                        ? 'border-blue-500 bg-blue-500/20 text-white' 
                        : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 group/input md:col-span-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Upload Diagrams / Images (Optional)</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-700 border-dashed rounded-xl cursor-pointer bg-slate-950/50 hover:bg-slate-900 transition-colors">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg className="w-8 h-8 mb-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                    <p className="text-xs text-slate-500">PNG, JPG or SVG (MAX. 800x400px)</p>
                  </div>
                  <input 
                    type="file" 
                    className="hidden" 
                    multiple 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files) {
                        setUploadedImages(Array.from(e.target.files));
                      }
                    }}
                  />
                </label>
              </div>
              {uploadedImages.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {uploadedImages.map((file, i) => (
                    <div key={i} className="bg-blue-500/10 text-blue-400 px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-2">
                      {file.name}
                      <button type="button" onClick={() => setUploadedImages(prev => prev.filter((_, idx) => idx !== i))}>×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4 bg-slate-800/30 p-6 rounded-2xl border border-slate-700/50">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Topics to Cover</label>
              <button 
                type="button" 
                onClick={addTopic}
                className="flex items-center gap-1 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg"
              >
                <PlusIcon /> Add Topic
              </button>
            </div>
            
            <div className="space-y-3">
              {topics.map((topic, index) => (
                <div key={index} className="flex gap-3 group/topic items-start">
                  <div className="flex-1">
                    <textarea 
                      value={topic} 
                      onChange={e => updateTopic(index, e.target.value)} 
                      className="w-full bg-slate-950/50 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-600 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none text-sm font-medium resize-none min-h-[80px]" 
                      placeholder={`e.g. Analyze the role of tools like Bhashini in promoting inclusivity in AI.`} 
                    />
                  </div>
                  {topics.length > 1 && (
                    <button 
                      type="button" 
                      onClick={() => removeTopic(index)}
                      className="p-4 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all mt-1"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isLoading} 
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg py-5 px-6 rounded-xl shadow-lg shadow-blue-500/20 transform transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group"
          >
            {isLoading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Case Studies...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Generate Case Study Report
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </span>
            )}
          </button>
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 animate-pulse">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-red-200 font-medium">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Result Card */}
      {reportData && (
        <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-700/50 p-8 rounded-[2rem] shadow-2xl animate-[slideUp_0.5s_ease-out]">
          <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 pb-6 border-b border-slate-700/50">
            <h3 className="text-2xl font-black text-white flex items-center gap-3">
              <div className="bg-green-500/20 text-green-400 rounded-xl p-2">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              Report Preview
            </h3>
            
            <div className="flex gap-3 w-full md:w-auto">
              <button 
                onClick={handleDownload} 
                disabled={isDownloading} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition font-bold active:scale-95 shadow-lg shadow-blue-500/20 disabled:opacity-50"
              >
                {isDownloading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : <DownloadIcon />}
                <span>{isDownloading ? 'Saving...' : 'Download .docx'}</span>
              </button>

              <button 
                onClick={() => navigator.clipboard.writeText(JSON.stringify(reportData, null, 2))} 
                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl transition font-bold text-slate-300 active:scale-95"
                title="Copy JSON Data"
              >
                <ClipboardIcon />
              </button>
            </div>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-inner max-h-[800px] overflow-y-auto text-gray-800 font-sans">
            {/* Cover Page Preview */}
            <div className="text-center mb-12">
                <h1 className="text-xl font-bold text-blue-900 mb-1">{reportData.institution}</h1>
                <h2 className="text-lg font-semibold text-blue-800 mb-4">{reportData.department}</h2>
                <div className="h-0.5 bg-blue-900 w-full mb-8"></div>
                <h3 className="text-2xl font-bold text-blue-700 mb-8">{reportData.subject}</h3>
                <div className="h-px bg-blue-300 w-1/2 mx-auto mb-8"></div>
                <h4 className="text-xl text-blue-600 mb-12">{reportData.reportType}</h4>
                
                <div className="max-w-md mx-auto text-left space-y-2 mb-12">
                    <div className="grid grid-cols-2">
                        <span className="font-bold">Student Name</span>
                        <span>: {reportData.studentName}</span>
                    </div>
                    <div className="grid grid-cols-2">
                        <span className="font-bold">Enrolment Number</span>
                        <span>: {reportData.enrolmentNumber}</span>
                    </div>
                    <div className="grid grid-cols-2">
                        <span className="font-bold">Class</span>
                        <span>: {reportData.class}</span>
                    </div>
                </div>

                <div className="h-px bg-gray-200 w-full mb-8"></div>

                <div className="text-left space-y-2">
                    {reportData.caseStudies.map((cs: any, idx: number) => (
                        <p key={idx} className="font-semibold text-blue-800">
                            Topic-{idx + 1}: <span className="text-blue-600">{cs.topicTitle}</span>
                        </p>
                    ))}
                </div>
            </div>

            {/* Topics Preview */}
            {reportData.caseStudies.map((cs: any, idx: number) => (
                <div key={idx} className="mt-16 pt-16 border-t border-gray-100">
                    <div className="bg-blue-900 text-white p-4 mb-8">
                        <h2 className="text-xl font-bold">Topic {idx + 1}: {cs.topicTitle}</h2>
                    </div>

                    <div className="space-y-8">
                        {templateType === 'Lab Report' ? (
                          <>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.1 Aim</h3>
                                <p className="leading-relaxed text-justify">{cs.aim}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.2 Apparatus/Tools</h3>
                                <p className="leading-relaxed text-justify">{cs.apparatus}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.3 Theory</h3>
                                <p className="leading-relaxed text-justify">{cs.theory}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.4 Procedure</h3>
                                <p className="leading-relaxed text-justify whitespace-pre-line">{cs.procedure}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.5 Observations/Results</h3>
                                <p className="leading-relaxed text-justify">{cs.observations}</p>
                            </section>
                          </>
                        ) : templateType === 'Technical Review' ? (
                          <>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.1 Abstract</h3>
                                <p className="leading-relaxed text-justify">{cs.abstract}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.2 Literature Review</h3>
                                <p className="leading-relaxed text-justify">{cs.literatureReview}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.3 Technical Analysis</h3>
                                <p className="leading-relaxed text-justify">{cs.technicalAnalysis}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.4 Comparison</h3>
                                <p className="leading-relaxed text-justify">{cs.comparison}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.5 Future Scope</h3>
                                <p className="leading-relaxed text-justify">{cs.futureScope}</p>
                            </section>
                          </>
                        ) : templateType === 'Project Proposal' ? (
                          <>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.1 Problem Statement</h3>
                                <p className="leading-relaxed text-justify">{cs.problemStatement}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.2 Proposed Solution</h3>
                                <p className="leading-relaxed text-justify">{cs.proposedSolution}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.3 Methodology</h3>
                                <p className="leading-relaxed text-justify">{cs.methodology}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.4 Resource Requirements</h3>
                                <p className="leading-relaxed text-justify">{cs.resourceRequirements}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.5 Expected Impact</h3>
                                <p className="leading-relaxed text-justify">{cs.expectedImpact}</p>
                            </section>
                          </>
                        ) : (
                          <>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.1 Introduction</h3>
                                <p className="leading-relaxed text-justify">{cs.introduction}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.2 Scenario</h3>
                                <p className="leading-relaxed text-justify">{cs.scenario}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.3 Prompt Given to AI</h3>
                                <div className="border border-gray-200 p-4 font-mono text-sm italic bg-gray-50">
                                    "{cs.promptGiven}"
                                </div>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.4 Output Generated by AI</h3>
                                <p className="leading-relaxed text-justify">{cs.aiOutput}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.5 Analysis of the Output</h3>
                                <p className="leading-relaxed text-justify">{cs.analysis}</p>
                            </section>
                            <section>
                                <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{idx + 1}.6 Limitations</h3>
                                <ul className="list-disc ml-6 space-y-2">
                                    {cs.limitations?.map((lim: string, lIdx: number) => (
                                        <li key={lIdx}>{lim}</li>
                                    ))}
                                </ul>
                            </section>
                          </>
                        )}

                        {/* User Uploaded Images Preview */}
                        {uploadedImages.length > 0 && idx === 0 && (
                          <section>
                            <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">Attached Diagrams</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {uploadedImages.map((file, i) => (
                                <div key={i} className="border border-gray-200 p-2 rounded-lg">
                                  <img 
                                    src={URL.createObjectURL(file)} 
                                    alt={file.name} 
                                    className="w-full h-auto rounded"
                                    referrerPolicy="no-referrer"
                                  />
                                  <p className="text-center text-xs mt-2 text-gray-500">{file.name}</p>
                                </div>
                              ))}
                            </div>
                          </section>
                        )}

                        <section>
                            <h3 className="bg-blue-50 text-blue-900 px-4 py-2 font-bold mb-4 border-l-4 border-blue-900">{templateType === 'Case Study' ? `${idx + 1}.7` : `${idx + 1}.6`} Conclusion</h3>
                            <p className="leading-relaxed text-justify">{cs.conclusion}</p>
                        </section>
                    </div>
                </div>
            ))}
          </div>
        </div>
      )}
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { transform: translateY(30px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>
    </div>
  );
};
