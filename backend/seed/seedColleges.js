require('dotenv').config();
const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const College = require('../models/College');

const DATASET_CONFIGS = [
  {
    type: 'Engineering',
    paths: [
      path.join(__dirname, 'colleges.json.csv'),
      path.join(__dirname, 'engineering.colleges.csv'),
    ],
  },
  {
    type: 'Polytechnic',
    paths: [
      path.join(__dirname, 'polytechnic.json.csv'),
      path.join(__dirname, 'polytechnic.colleges.csv'),
    ],
  },
  {
    type: 'Medical',
    paths: [
      path.join(__dirname, 'medicalcolleges.json.csv'),
      path.join(__dirname, 'medical.colleges.csv'),
    ],
  },
  {
    type: 'Law',
    paths: [
      path.join(__dirname, 'lawcolleges.json.csv'),
      path.join(__dirname, 'law.colleges.csv'),
    ],
  },
];

const splitCsvLine = (line = '') => {
  const values = [];
  let current = '';
  let insideQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const nextChar = line[index + 1];

    if (char === '"' && nextChar === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (char === ',' && !insideQuotes) {
      values.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  values.push(current.trim());
  return values;
};

const toNumber = (value) => {
  if (value === undefined || value === null) return null;

  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === 'n/a') return null;

  const parsed = Number(normalized.replace(/[^0-9.-]/g, ''));
  return Number.isNaN(parsed) ? null : parsed;
};

const toCurrencyAmount = (value) => {
  const parsed = toNumber(value);

  if (parsed === null) return null;

  // CSV package values are in LPA, while the app expects rupees.
  if (parsed > 0 && parsed < 1000) {
    return Math.round(parsed * 100000);
  }

  return parsed;
};

const toRangeBoundaryNumber = (value, strategy = 'max') => {
  if (value === undefined || value === null) return null;

  const normalized = String(value).trim();
  if (!normalized || normalized.toLowerCase() === 'n/a') return null;

  const numbers = normalized
    .split('-')
    .map((part) => toNumber(part))
    .filter((part) => part !== null);

  if (!numbers.length) {
    return toNumber(normalized);
  }

  return strategy === 'min' ? Math.min(...numbers) : Math.max(...numbers);
};

const toLawCutoffNumber = (value) => {
  const numericValue = toRangeBoundaryNumber(value, 'max');
  if (numericValue !== null) return numericValue;

  const normalized = String(value || '').trim().toLowerCase();
  if (!normalized) return null;
  if (normalized.includes('top rank')) return 95;
  if (normalized.includes('moderate')) return 70;
  return null;
};

const normalizeColumns = (columns = []) => columns.map((value) => String(value || '').trim().toLowerCase());

const getColumnValue = (columns, headerMap, names = []) => {
  const columnName = names.find((name) => headerMap.has(name));
  if (!columnName) return '';
  return columns[headerMap.get(columnName)] || '';
};

const buildEngineeringCollegeRecord = ({ columns, headerMap, type }) => ({
  name: getColumnValue(columns, headerMap, ['name']),
  location: getColumnValue(columns, headerMap, ['location']),
  course: getColumnValue(columns, headerMap, ['course']),
  cutoffRank: toNumber(getColumnValue(columns, headerMap, ['cutoff rank'])),
  fees: toCurrencyAmount(getColumnValue(columns, headerMap, ['fee (inr)'])),
  avgPackage: toCurrencyAmount(getColumnValue(columns, headerMap, ['avg package (lpa)'])),
  type,
});

const buildPolytechnicCollegeRecord = ({ columns, headerMap, type }) => ({
  name: getColumnValue(columns, headerMap, ['college name']),
  location:
    getColumnValue(columns, headerMap, ['district']) ||
    getColumnValue(columns, headerMap, ['area']),
  course: getColumnValue(columns, headerMap, ['branch']),
  cutoffRank:
    toNumber(getColumnValue(columns, headerMap, ['oc rank'])) ||
    toNumber(getColumnValue(columns, headerMap, ['bc rank'])) ||
    toNumber(getColumnValue(columns, headerMap, ['sc rank'])) ||
    toNumber(getColumnValue(columns, headerMap, ['st rank'])),
  fees: toCurrencyAmount(getColumnValue(columns, headerMap, ['tuition fee'])),
  avgPackage: 0,
  type,
});

const buildMedicalCollegeRecord = ({ columns, headerMap, type }) => ({
  name: getColumnValue(columns, headerMap, ['college name']),
  location:
    getColumnValue(columns, headerMap, ['location']) ||
    getColumnValue(columns, headerMap, ['district']),
  course: 'MBBS',
  cutoffRank:
    toRangeBoundaryNumber(getColumnValue(columns, headerMap, ['cutoff oc'])) ||
    toRangeBoundaryNumber(getColumnValue(columns, headerMap, ['cutoff bc'])) ||
    toRangeBoundaryNumber(getColumnValue(columns, headerMap, ['cutoff sc'])) ||
    toRangeBoundaryNumber(getColumnValue(columns, headerMap, ['cutoff st'])),
  fees: toRangeBoundaryNumber(
    getColumnValue(columns, headerMap, ['tuition fees (yearly inr)']),
    'max'
  ),
  avgPackage: 0,
  type,
});

const buildLawCollegeRecord = ({ columns, headerMap, type }) => ({
  name: getColumnValue(columns, headerMap, ['college name']),
  location:
    getColumnValue(columns, headerMap, ['location']) ||
    getColumnValue(columns, headerMap, ['district']),
  course: getColumnValue(columns, headerMap, ['courses']),
  cutoffRank:
    toLawCutoffNumber(getColumnValue(columns, headerMap, ['cutoff oc'])) ||
    toLawCutoffNumber(getColumnValue(columns, headerMap, ['cutoff bc'])) ||
    toLawCutoffNumber(getColumnValue(columns, headerMap, ['cutoff sc'])) ||
    toLawCutoffNumber(getColumnValue(columns, headerMap, ['cutoff st'])),
  fees: toCurrencyAmount(getColumnValue(columns, headerMap, ['fees (yearly inr)'])),
  avgPackage: 0,
  type,
});

const getRecordBuilder = (type) => {
  if (type === 'Polytechnic') {
    return buildPolytechnicCollegeRecord;
  }

  if (type === 'Medical') {
    return buildMedicalCollegeRecord;
  }

  if (type === 'Law') {
    return buildLawCollegeRecord;
  }

  return buildEngineeringCollegeRecord;
};

const resolveExistingDatasetPath = (paths = []) => paths.find((filePath) => fs.existsSync(filePath)) || null;

const buildCollegesFromCsv = ({ csvPath, type }) => {
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Dataset file not found at ${csvPath}`);
  }

  const rawCsv = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = rawCsv.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    throw new Error('Dataset CSV is empty or missing rows.');
  }

  const headers = normalizeColumns(splitCsvLine(lines[0]));
  const headerMap = new Map(headers.map((header, index) => [header, index]));
  const rows = lines.slice(1).map(splitCsvLine);
  const collegeMap = new Map();
  const buildRecord = getRecordBuilder(type);

  rows.forEach((columns) => {
    const {
      name,
      location,
      course,
      cutoffRank,
      fees,
      avgPackage,
    } = buildRecord({ columns, headerMap, type });

    if (!name || !location) {
      return;
    }

    const key = `${name.trim().toLowerCase()}::${location.trim().toLowerCase()}`;
    const currentCollege = collegeMap.get(key) || {
      name: name.trim(),
      location: location.trim(),
      type,
      courses: [],
      cutoff_rank: 0,
      fees: 0,
      avg_package: 0,
    };

    const courseValues = String(course || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);

    courseValues.forEach((courseValue) => {
      if (!currentCollege.courses.includes(courseValue)) {
        currentCollege.courses.push(courseValue);
      }
    });

    const parsedCutoff = toNumber(cutoffRank);
    const parsedFees = toCurrencyAmount(fees);
    const parsedAvgPackage = toCurrencyAmount(avgPackage);

    currentCollege.cutoff_rank = Math.max(currentCollege.cutoff_rank, parsedCutoff || 0);
    currentCollege.fees = Math.max(currentCollege.fees, parsedFees || 0);
    currentCollege.avg_package = Math.max(currentCollege.avg_package, parsedAvgPackage || 0);

    collegeMap.set(key, currentCollege);
  });

  return Array.from(collegeMap.values()).filter(
    (college) =>
      college.name &&
      college.location &&
      college.type &&
      college.courses.length > 0 &&
      college.cutoff_rank > 0
  );
};

const buildAllCollegesFromDatasets = () => {
  const colleges = [];

  DATASET_CONFIGS.forEach((dataset) => {
    const existingPath = resolveExistingDatasetPath(dataset.paths);

    if (!existingPath) {
      return;
    }

    colleges.push(
      ...buildCollegesFromCsv({
        csvPath: existingPath,
        type: dataset.type,
      })
    );
  });

  if (!colleges.length) {
    const expectedPaths = DATASET_CONFIGS.flatMap((dataset) => dataset.paths);
    throw new Error(`No dataset file found. Expected one of: ${expectedPaths.join(', ')}`);
  }

  return colleges;
};

const seedData = async () => {
  try {
    const colleges = buildAllCollegesFromDatasets();

    await connectDB();
    await College.deleteMany();
    await College.insertMany(colleges);

    console.log(`Seed data inserted successfully: ${colleges.length} colleges`);
    process.exit(0);
  } catch (error) {
    console.error(`Error while seeding data: ${error.message}`);
    process.exit(1);
  }
};

seedData();
