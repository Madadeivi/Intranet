import { Request, Response, NextFunction } from 'express';
import { 
  getRecords, 
  getRecordById, 
  createRecord, 
  updateRecord, 
  deleteRecord 
} from '../services/zohoCRMService.js';

export const fetchZohoRecords = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { moduleName } = req.params;
  try {
    const records = await getRecords(moduleName);
    res.status(200).json(records);
  } catch (error) {
    next(error);
  }
};

export const fetchZohoRecordById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { moduleName, recordId } = req.params;
  try {
    const record = await getRecordById(moduleName, recordId);
    if (record) {
      res.status(200).json(record);
    } else {
      res.status(404).json({ message: 'Record not found.' });
    }
  } catch (error) {
    next(error);
  }
};

export const createZohoRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { moduleName } = req.params;
  const recordData = req.body;
  try {
    const newRecord = await createRecord(moduleName, recordData);
    res.status(201).json(newRecord);
  } catch (error) {
    next(error);
  }
};

export const updateZohoRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { moduleName, recordId } = req.params;
  const recordData = req.body;
  try {
    const updatedRecord = await updateRecord(moduleName, recordId, recordData);
    res.status(200).json(updatedRecord);
  } catch (error) {
    next(error);
  }
};

export const deleteZohoRecord = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { moduleName, recordId } = req.params;
  try {
    await deleteRecord(moduleName, recordId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

// Add other controller functions as needed
