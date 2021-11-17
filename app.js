async function startProcess() {
  document
    .querySelector('.main-screen')
    .insertAdjacentHTML(
      'beforeend',
      '<h2>Processing Previous EB Report...</h2>'
    );

  const oldLepFile = document.getElementById('old-lep').files[0];
  const dataOld = await oldLepFile.text();
  const rowsOld = dataOld.split('\n');
  const oldLepArray = [];

  let rowCounter = 0;
  rowsOld.forEach(el => {
    rowCounter++;

    if (rowCounter > 1) {
      const row = el.split(',');
      let studentId = row[4];

      if (studentId) {
        studentId = studentId.trim();
        // oldLepArray.push(studentId);
      }
    }
  });

  ////////////////////////////////////////////////
  document
    .querySelector('.main-screen')
    .insertAdjacentHTML(
      'beforeend',
      '<h2>Processing Current EB Report...</h2>'
    );

  const newLepFile = document.getElementById('new-lep').files[0];
  const dataNew = await newLepFile.text();
  const rowsNew = dataNew.split('\n');
  const newLepArray = [];

  rowCounter = 0;
  rowsNew.forEach(el => {
    rowCounter++;

    if (rowCounter > 1) {
      const row = el.split(',');
      let studentId = row[4];

      const lepIndicator = row[9] ? row[9].trim() : 'blank';

      if (studentId) {
        studentId = studentId.trim();
        const foundStudent = oldLepArray.find(el => el === studentId);
        if (!foundStudent && lepIndicator === '1') {
          let tid = 'blank';
          if (row[34]) {
            tid = row[34].trim();
          }
          const studentInfo = {
            id: studentId,
            name: row[3],
            last: row[2],
            grade: row[1],
            esl: row[10],
            bil: row[11],
            alt: row[30],
            pp: row[12],
            teacherId: tid,
          };
          newLepArray.push(studentInfo);
        }
      }
    }
  });

  ////////////////////////////////////////////////
  document
    .querySelector('.main-screen')
    .insertAdjacentHTML(
      'beforeend',
      '<h2>Processing Teacher Certifications...</h2>'
    );

  const certificationsFile = document.getElementById('certifications').files[0];
  const dataCert = await certificationsFile.text();
  const rowsCert = dataCert.split('\n');
  const certificationsArray = [];

  rowCounter = 0;
  rowsCert.forEach(el => {
    rowCounter++;

    if (rowCounter > 1) {
      const row = el.split(',');

      const teacherInfo = {
        id: 'blank',
        last: 'blank',
        first: 'blank',
        campus: 'blank',
        assignment: 'blank',
        certifications: 'blank',
        grades: 'blank',
        type: 'blank',
        effective: 'blank',
        expiration: 'blank',
      };

      if (row[0]) {
        teacherInfo.id = row[0].trim();
      }
      if (row[1]) {
        teacherInfo.last = row[1].trim();
      }
      if (row[2]) {
        teacherInfo.first = row[2].trim();
      }
      if (row[3]) {
        teacherInfo.campus = row[3].trim();
      }
      if (row[4]) {
        teacherInfo.assignment = row[4].trim();
      }
      if (row[5]) {
        teacherInfo.certifications = row[5].trim();
      }
      if (row[6]) {
        teacherInfo.grades = row[6].trim();
      }
      if (row[7]) {
        teacherInfo.type = row[7].trim();
      }
      if (row[8]) {
        teacherInfo.effective = row[8].trim();
      }
      if (row[9]) {
        teacherInfo.expiration = row[9].trim();
      }

      certificationsArray.push(teacherInfo);
    }
  });

  ////////////////////////////////////////////////
  document
    .querySelector('.main-screen')
    .insertAdjacentHTML(
      'beforeend',
      '<h2>Matching Teacher Certifications for New EB students...</h2>'
    );

  newLepArray.forEach(el => {
    const tid = el.teacherId;
    const foundTeacherArray = certificationsArray.filter(el => el.id === tid);

    if (foundTeacherArray.length > 0) {
      foundTeacherArray.forEach(t => {
        const resultObject = {
          studentId: el.id,
          studentName: el.name,
          studentLast: el.last,
          studentGrade: el.grade,
          studentParentPermission: el.pp,
          studentEslProgram: el.esl,
          studentBilProgram: el.bil,
          studentAltProgram: el.alt,
          teacherId: el.teacherId,
          teacherLast: t.last,
          teacherFirst: t.first,
          teacherLocation: t.campus,
          teacherAssignment: t.assignment,
          teacherCertification: t.certifications,
          teacherGrades: t.grades,
          teacherCertType: t.type,
          teacherCertEffective: t.effective,
          teacherCertExpiration: t.expiration,
        };
        resultArray.push(resultObject);
      });
    } else {
      const resultObject = {
        studentId: el.id,
        studentName: el.name,
        studentLast: el.last,
        studentGrade: el.grade,
        studentParentPermission: el.pp,
        studentEslProgram: el.esl,
        studentBilProgram: el.bil,
        studentAltProgram: el.alt,
        teacherId: el.teacherId,
        teacherLast: 'Not Found',
        teacherFirst: 'Not Found',
        teacherLocation: 'Not Found',
        teacherAssignment: 'Not Found',
        teacherCertification: 'Not Found',
        teacherGrades: 'Not Found',
        teacherCertType: 'Not Found',
        teacherCertEffective: 'Not Found',
        teacherCertExpiration: 'Not Found',
      };
      resultArray.push(resultObject);
    }
  });

  performChecks();

  downloadAsExcel(resultArray);
}

function performChecks() {
  resultArray.forEach(el => {
    console.log(JSON.parse(JSON.stringify(el)));

    let analysisMessage = '';

    if (el.studentEslProgram === '2' || el.studentEslProgram === '3') {
      if (
        ![
          'Bilingual Education Supplemental-Spanish',
          'Bilingual Generalist',
          'Bilingual Generalist-Spanish',
          'Bilingual/ESL',
          'Elementary Bilingual/ESL',
          'English as a Second Language',
          'English as a Second Language Generalist',
          'English as a Second Language Supplemental',
        ].includes(el.teacherCertification)
      ) {
        analysisMessage = analysisMessage + 'ESL Certification missing. ';
      }
    }

    if (el.studentBilProgram === '4' || el.studentBilProgram === '5') {
      if (
        ![
          'Bilingual Education Supplemental-Spanish',
          'Bilingual Generalist',
          'Bilingual Generalist-Spanish',
          'Bilingual/ESL',
          'Elementary Bilingual/ESL',
        ].includes(el.teacherCertification)
      ) {
        analysisMessage = analysisMessage + 'Bilingual Certification missing. ';
      }
    }

    if (el.studentAltProgram === '01' || el.studentAltProgram === '02') {
      analysisMessage =
        analysisMessage + 'Student with teacher in an Alternative Program. ';
    }

    if (el.studentGrade === 'PK') {
      if (
        ![
          'EC-12',
          'EC-4',
          'EC-6',
          'Grades (EC-12)',
          'Grades (EC-4)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach PK. ';
      }
    }

    if (el.studentGrade === 'KG') {
      if (
        ![
          'EC-12',
          'EC-4',
          'EC-6',
          'Grades (EC-12)',
          'Grades (EC-4)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach KG. ';
      }
    }

    if (el.studentGrade === '01') {
      if (
        ![
          'EC-12',
          'EC-4',
          'EC-6',
          'Grades (1-12)',
          'Grades (1-6)',
          'Grades (1-8)',
          'Grades (EC-12)',
          'Grades (EC-4)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach 1st. ';
      }
    }

    if (el.studentGrade === '02') {
      if (
        ![
          'EC-12',
          'EC-4',
          'EC-6',
          'Grades (1-12)',
          'Grades (1-6)',
          'Grades (1-8)',
          'Grades (EC-12)',
          'Grades (EC-4)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach 2nd. ';
      }
    }

    if (el.studentGrade === '03') {
      if (
        ![
          'EC-12',
          'EC-4',
          'EC-6',
          'Grades (1-12)',
          'Grades (1-6)',
          'Grades (1-8)',
          'Grades (EC-12)',
          'Grades (EC-4)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach 3rd. ';
      }
    }

    if (el.studentGrade === '04') {
      if (
        ![
          'EC-12',
          'EC-4',
          'EC-6',
          'Grades (1-12)',
          'Grades (1-6)',
          'Grades (1-8)',
          'Grades (4-12)',
          'Grades (4-8)',
          'Grades (EC-12)',
          'Grades (EC-4)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach 4th. ';
      }
    }

    if (el.studentGrade === '05') {
      if (
        ![
          'EC-12',
          'EC-6',
          'Grades (1-12)',
          'Grades (1-6)',
          'Grades (1-8)',
          'Grades (4-12)',
          'Grades (4-8)',
          'Grades (EC-12)',
          'Grades (EC-6)',
          'Grades (EC-8)',
          'Grades (PK-12)',
          'Grades (PK-6)',
          'Grades (PK-8)',
        ].includes(el.teacherGrades)
      ) {
        analysisMessage =
          analysisMessage + 'Teacher not certified to teach 5th. ';
      }
    }

    const effectiveDate = new Date(el.teacherCertEffective);
    const expirationDate = new Date(el.teacherCertExpiration);
    const todayDate = new Date();

    if (todayDate < effectiveDate || todayDate > expirationDate) {
      analysisMessage =
        analysisMessage + 'Certification has expired or not yet started. ';
    }

    if (analysisMessage === '') {
      analysisMessage = 'Certification in compliance. ';
    }

    el.analysis = analysisMessage;

    console.log(el);
  });
}

function downloadAsExcel(resultArray) {
  const worksheet = XLSX.utils.json_to_sheet(resultArray);
  const workbook = {
    Sheets: {
      data: worksheet,
    },
    SheetNames: ['data'],
  };
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  saveAsExcel(excelBuffer, 'file');
}

function saveAsExcel(buffer, filename) {
  const data = new Blob([buffer], { type: EXCEL_TYPE });
  saveAs(data, filename + '_export_' + new Date().getTime() + EXCEL_EXTENSION);
}

/// ************  CONSTANTS ******************* ////

const resultArray = [];

const EXCEL_TYPE =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const EXCEL_EXTENSION = '.xlsx';

const GRADES = ['01', '02', '03', '04', '05', 'KG', 'PK'];
const ESL_PROGRAMS = ['2', '3'];
const BIL_PROGRAMS = ['4', '5'];
const ALT_PROGRAMS = ['01', '02'];
const CERTIFICATIONS = [
  'Bilingual Education Supplemental-Spanish',
  'Bilingual Generalist',
  'Bilingual Generalist-Spanish',
  'Bilingual/ESL',
  'Elementary Bilingual/ESL',
  'English as a Second Language',
  'English as a Second Language Generalist',
  'English as a Second Language Supplemental',
];
const CERT_GRADES = [
  'EC-12',
  'EC-4',
  'EC-6',
  'Grades (1-12)',
  'Grades (1-6)',
  'Grades (1-8)',
  'Grades (4-12)',
  'Grades (4-8)',
  'Grades (EC-12)',
  'Grades (EC-4)',
  'Grades (EC-6)',
  'Grades (EC-8)',
  'Grades (PK-12)',
  'Grades (PK-6)',
  'Grades (PK-8)',
];
