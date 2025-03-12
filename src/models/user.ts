

import { ObjectId } from 'mongodb';
import { getDb, COLLECTIONS } from '@/lib/mongodb';
import { generateOTP } from '@/utils/auth';
import { emailService } from '@/services/email-service';

export interface User {
  _id?: ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  createdAt: Date;
  updatedAt: Date;
  isVerified: boolean;
  customerId?: string; 
  otp?: {
    code: string;
    expiresAt: Date;
  };
  kycStatus?: 'NONE' | 'IN_REVIEW' | 'PENDING' | 'COMPLETED' | 'UPDATE_REQUIRED' | 'FAILED';
  kycData?: {
    firstName?: string;
    lastName?: string;
    dateOfBirth?: string;
    nationality?: string;
    countryOfResidence?: string;
    submissionId?: string;
    statusReason?: string;
    kycLevel?: string;
  };
  role?: string;
}

export class UserModel {
  /**
   * Create a new user or update an existing one
   */
  static async createOrUpdateUser(email: string): Promise<User> {
    const db = await getDb();
    const collection = db.collection<User>(COLLECTIONS.USERS);
    
    // Generate OTP for verification
    const otp = generateOTP();
    const otpExpiresAt = new Date();
    otpExpiresAt.setMinutes(otpExpiresAt.getMinutes() + 10); // 10 minutes expiry
    
    // Find existing user or create a new one
    const now = new Date();
    const user = await collection.findOneAndUpdate(
      { email },
      { 
        $set: { 
          email,
          otp: {
            code: otp,
            expiresAt: otpExpiresAt
          },
          updatedAt: now
        },
        $setOnInsert: { 
          createdAt: now,
          isVerified: false,
          kycStatus: 'NONE'
        }
      },
      { 
        upsert: true,
        returnDocument: 'after'
      }
    );
    
    if (!user) {
      throw new Error('Failed to create or update user');
    }
    
    // Send verification email
    await emailService.sendVerificationEmail(email, otp);
    
    return user;
  }
  
  /**
   * Verify user with OTP
   */
  static async verifyOTP(email: string, otp: string): Promise<User | null> {
    const db = await getDb();
    const collection = db.collection<User>(COLLECTIONS.USERS);
    
    // Find user by email
    const user = await collection.findOne({ email });
    
    if (!user) {
      return null;
    }
    
    // Verify OTP
    if (
      !user.otp || 
      user.otp.code !== otp || 
      new Date() > new Date(user.otp.expiresAt)
    ) {
      return null;
    }
    
    // Mark user as verified and clear OTP
    const updatedUser = await collection.findOneAndUpdate(
      { email },
      { 
        $set: { 
          isVerified: true,
          updatedAt: new Date()
        },
        $unset: { otp: "" }
      },
      { returnDocument: 'after' }
    );
    
    // If this is the first verification, send welcome email
    if (updatedUser && !user.isVerified) {
      await emailService.sendWelcomeEmail(email, user.firstName);
    }
    
    return updatedUser;
  }
  
  /**
   * Get user by email
   */
  static async getUserByEmail(email: string): Promise<User | null> {
    const db = await getDb();
    return db.collection<User>(COLLECTIONS.USERS).findOne({ email });
  }
  
  /**
   * Find user by customerId
   */
  static async findByCustomerId(customerId: string): Promise<User | null> {
    const db = await getDb();
    return db.collection<User>(COLLECTIONS.USERS).findOne({ customerId });
  }
  
  /**
   * Update user profile
   */
  static async updateUserProfile(
    email: string, 
    data: { firstName?: string; lastName?: string }
  ): Promise<User | null> {
    const db = await getDb();
    
    return db.collection<User>(COLLECTIONS.USERS).findOneAndUpdate(
      { email },
      { 
        $set: { 
          ...data,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
  
  /**
   * Update user customerId
   */
  static async updateCustomerId(
    email: string,
    customerId: string
  ): Promise<User | null> {
    const db = await getDb();
    
    return db.collection<User>(COLLECTIONS.USERS).findOneAndUpdate(
      { email },
      { 
        $set: { 
          customerId,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
  
  /**
   * Update user KYC data
   */
  static async updateKYCData(
    email: string,
    kycData: User['kycData'],
    kycStatus: User['kycStatus'] = 'PENDING'
  ): Promise<User | null> {
    const db = await getDb();
    
    return db.collection<User>(COLLECTIONS.USERS).findOneAndUpdate(
      { email },
      { 
        $set: { 
          kycData,
          kycStatus,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
  
  /**
   * Update user KYC status
   */
  static async updateKYCStatus(
    email: string,
    kycStatus: User['kycStatus'],
    statusReason?: string | null,
    kycLevel?: string
  ): Promise<User | null> {
    const db = await getDb();
    
    return db.collection<User>(COLLECTIONS.USERS).findOneAndUpdate(
      { email },
      { 
        $set: { 
          kycStatus,
          ...(statusReason ? { 'kycData.statusReason': statusReason } : {}),
          ...(kycLevel ? { 'kycData.kycLevel': kycLevel } : {}),
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );
  }
}