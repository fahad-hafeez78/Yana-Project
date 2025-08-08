const config = require('../config/config'); 
const nodemailer = require("nodemailer");
const path = require('path');
const xlsx = require("xlsx");
const moment = require("moment"); 
const axios = require('axios');
const ffmpeg = require('fluent-ffmpeg'); 
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path; 
ffmpeg.setFfmpegPath(ffmpegPath);
const fs = require('fs'); 
const os = require('os');
const { promisify } = require('util');
const { User, Coordinator, Insurance, Admin, Customer, Role } = require('../models');
const firebaseConfig = require("../config/firebase"); 
const logger = require('../config/logger');  
const twilioClient = require('twilio')(config.twilioAccountSID, config.twilioAuthToken);

// Promisify fs functions for cleaner async/await usage
const writeFile = promisify(fs.writeFile);
const readFile = promisify(fs.readFile);
const unlink = promisify(fs.unlink);

const transporter = nodemailer.createTransport({
  service: config.smtp.smtp_service,
  host: config.smtp.smtp_host,
  port: config.smtp.smtp_port,
  secure: config.smtp.smtp_encryption, 
  auth: {
    user: config.smtp.smtp_username,
    pass: config.smtp.smtp_password,
  },
  // logger: true,
});

// ==================={Generate Random Password}====================
const generateRandomPassword = async (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let password = '';
    for (let i = 0; i < length; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
};

// ==================={Generate Unique Username}====================
const generateUniqueUsername = async (email) => {
    const generateUsername = (email) => {
      const temp = email.split('@')[0];
      const randomNumber = Math.floor(Math.random() * 10000);
      return `${temp}${randomNumber}`;
    };
  
    let username;
    let existingUser;
  
    // Generate a username and check if it already exists in the database
    do {
      username = generateUsername(email);
      existingUser = await User.findOne({ username });
    } while (existingUser);
    
    return username;
};

const generateUniqueUsernameAndPasswordCustomer = async (fName, dob) => {
  let firstName = fName.toLowerCase();
  const generateUsername = () => {
    const randomNumber = Math.floor(Math.random() * 10000);
    return `${firstName}${randomNumber}`;
  };

  let username;
  let existingUser;
  do {
    username = generateUsername();
    existingUser = await User.findOne({ username });
  } while (existingUser);

  const basePassword = `${firstName}${dob.replace(/-/g, '')}`; 

  return { username, password: basePassword };
};

const sendAccountCreationEmail = async (recipientEmail, name, username, tempPassword) => {
  try {
    const subject = `Welcome to YANA APP, ${name}!`;
    const appLink = "https://yana.physicianmarketing.us/";

    const logoPath = path.resolve(__dirname, '../assets/logo.png');
    console.log("Logo path resolved to:", logoPath);

    const message = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <img src="cid:logo" alt="Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
        <h1>Welcome, ${name}!</h1>
        <p>Your account has been successfully created on YANA APP.</p>
        <p><strong>Here are your login credentials:</strong></p>
        <p><strong>Email:</strong> ${recipientEmail}</p>
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Temporary Password:</strong> ${tempPassword}</p>
        <p>
          <strong>Access Your Dashboard:</strong><br>
          <a href="${appLink}" target="_blank" style="color: #1d70b8; text-decoration: none;">
            ${appLink}
          </a>
        </p>
        <p>Please log in to your account and update your password as soon as possible for security purposes.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p><strong>Enjoy using our app!</strong></p>
        <footer style="margin-top: 20px; color: #777; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </footer>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `'YANA APP' <${config.smtp.smtp_username}>`,
      to: recipientEmail,
      subject: subject,
      html: message,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
      ],
    });

    console.log("Account creation email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.stack);
  }
}

const sendPasswordResetOTPEmail = async (recipientEmail, name, otp) => {
  try {
    const subject = `Password Reset Request for YANA APP, ${name}`;

    const logoPath = path.resolve(__dirname, '../assets/yana_logo.png');
    console.log("Logo path resolved to:", logoPath);

    const message = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <img src="cid:logo" alt="Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
        <h1>Password Reset Request</h1>
        <p>Hello, ${name}!</p>
        <p>We received a request to reset your password for your YANA APP account.</p>
        <p><strong>Your OTP (One-Time Password) is:</strong> ${otp}</p>
        <p><strong>Important:</strong> This OTP will expire in 10 minutes, so please use it promptly to reset your password.</p>
        <p>If you did not request this, please ignore this email or contact support.</p>
        <footer style="margin-top: 20px; color: #777; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </footer>
      </div>
    `;
    
    const info = await transporter.sendMail({
      from: `'YANA APP' <${config.smtp.smtp_username}>`,
      to: recipientEmail,
      subject: subject,
      html: message,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
      ],
    });

    console.log("Password reset OTP email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.stack);
  }
};

const sendPasswordResetOTPEmailForRider = async (recipientEmail, name, otp) => {
  try {
    const subject = `Password Reset Request for YANA Rider APP, ${name}`;

    const logoPath = path.resolve(__dirname, '../assets/rider_logo.png');
    console.log("Logo path resolved to:", logoPath);

    const message = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <img src="cid:logo" alt="Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
        <h1>Password Reset Request</h1>
        <p>Hello, ${name}!</p>
        <p>We received a request to reset your password for your YANA Rider APP account.</p>
        <p><strong>Your OTP (One-Time Password) is:</strong> ${otp}</p>
        <p><strong>Important:</strong> This OTP will expire in 10 minutes, so please use it promptly to reset your password.</p>
        <p>If you did not request this, please ignore this email or contact support.</p>
        <footer style="margin-top: 20px; color: #777; font-size: 12px;">
          This is an automated email. Please do not reply to this email.
        </footer>
      </div>
    `;
    
    const info = await transporter.sendMail({
      from: `'YANA APP' <${config.smtp.smtp_username}>`,
      to: recipientEmail,
      subject: subject,
      html: message,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
      ],
    });

    console.log("Password reset OTP email sent successfully: %s", info.messageId);
  } catch (error) {
    console.error("Error sending email:", error.stack);
  }
};

const sendPasswordResetConfirmationEmail = async (recipientEmail, name) => {
  try {
    const subject = `Password Reset Successful – YANA APP`;

    const logoPath = path.resolve(__dirname, '../assets/logo.png');
    console.log("Logo path resolved to:", logoPath);

    const message = `
      <div style="text-align: center; font-family: Arial, sans-serif;">
        <img src="cid:logo" alt="YANA Logo" style="width: 100px; height: auto; margin-bottom: 20px;" />
        <h1>Password Reset Successful</h1>
        <p>Hi ${name},</p>
        <p>This is a confirmation that your password for your YANA APP account has been successfully reset.</p>
        <p>If you did not perform this action, please contact our support team immediately.</p>
        <footer style="margin-top: 20px; color: #777; font-size: 12px;">
          This is an automated message. Please do not reply to this email.
        </footer>
      </div>
    `;

    const info = await transporter.sendMail({
      from: `'YANA APP' <${config.smtp.smtp_username}>`,
      to: recipientEmail,
      subject: subject,
      html: message,
      attachments: [
        {
          filename: 'logo.png',
          path: logoPath,
          cid: 'logo',
        },
      ],
    });

    console.log("Password reset confirmation email sent: %s", info.messageId);
  } catch (error) {
    console.error("Error sending confirmation email:", error.stack);
  }
};
  
function formatDate(inputDate) {
  inputDate = String(inputDate).trim();
  let formattedDate;

  if (!isNaN(inputDate)) {
    let dateObj = xlsx.SSF.parse_date_code(parseFloat(inputDate));
    formattedDate = moment.utc({ year: dateObj.y, month: dateObj.m - 1, day: dateObj.d }).format("YYYY-MM-DD");
  } else if (moment.utc(inputDate, moment.ISO_8601, true).isValid()) {
    formattedDate = moment.utc(inputDate).format("YYYY-MM-DD");
  } else if (!isNaN(Date.parse(inputDate))) {

    formattedDate = moment.utc(new Date(inputDate)).format("YYYY-MM-DD");
  } else {
    console.error("Invalid date format:", inputDate);
    return null;
  }
  return formattedDate;
}
 
function isCurrentMonthAndYear(dateString) {
  dateString = String(dateString)
  let givenDate = moment(dateString, "YYYY-MM-DD");
  let currentMonth = moment().month(); 
  let currentYear = moment().year();
  return givenDate.month() === currentMonth && givenDate.year() === currentYear;
}

function combineAndSegregateRows(data, ignoredFields = []) {
  const groupedData = {};

  // Group rows by MemberID and MedicaidID
  data.forEach(row => {
    const key = `${row.MemberID}_${row.MedicaidID}`;
    if (!groupedData[key]) {
      groupedData[key] = {
        ...row,
        Name: `${row.FirstName || ''} ${row.LastName || ''}`.trim(),
        MCPT: null,
        PCPT: null,
        MAuthUnitsApproved: null,
        PAuthUnitsApproved: null,
        MFrequency: null,
        PFrequency: null,
      };

      // Remove ignored fields from the initial row
      ignoredFields.forEach(field => {
        delete groupedData[key][field];
      });
    }

    // Process Code, AuthUnitsApproved, and Frequency fields
    if (row.Code) {
      if (row.Code.startsWith("W17")) {
        // Add to MCPT, MAuthUnitsApproved, and MFrequency
        groupedData[key].MCPT = groupedData[key].MCPT
          ? `${groupedData[key].MCPT}, ${row.Code}`
          : row.Code;

        groupedData[key].MAuthUnitsApproved = groupedData[key].MAuthUnitsApproved
          ? `${groupedData[key].MAuthUnitsApproved}, ${row.AuthUnitsApproved}`
          : row.AuthUnitsApproved;

        groupedData[key].MFrequency = groupedData[key].MFrequency
          ? `${groupedData[key].MFrequency}, ${row.Frequency}`
          : row.Frequency;
      } else if (row.Code.startsWith("W18")) {
        // Add to PCPT, PAuthUnitsApproved, and PFrequency
        groupedData[key].PCPT = groupedData[key].PCPT
          ? `${groupedData[key].PCPT}, ${row.Code}`
          : row.Code;

        groupedData[key].PAuthUnitsApproved = groupedData[key].PAuthUnitsApproved
          ? `${groupedData[key].PAuthUnitsApproved}, ${row.AuthUnitsApproved}`
          : row.AuthUnitsApproved;

        groupedData[key].PFrequency = groupedData[key].PFrequency
          ? `${groupedData[key].PFrequency}, ${row.Frequency}`
          : row.Frequency;
      }
    }

    // Combine other fields dynamically (excluding ignored fields)
    for (const field in row) {
      if (!ignoredFields.includes(field) && row[field] !== groupedData[key][field]) {
        if (!groupedData[key][field]) {
          groupedData[key][field] = row[field];
        } else {
          const currentValue = String(groupedData[key][field]);
          const newValue = String(row[field]);
          if (!currentValue.includes(newValue)) {
            groupedData[key][field] = `${currentValue}, ${newValue}`;
          }
        }
      }
    }

    groupedData[key].Name = `${row.FirstName || ''} ${row.LastName || ''}`.trim();
  });

  // Convert grouped data back to an array
  return Object.values(groupedData);
}

const getOrCreateCoordinator = async (data, cache) => {
  const key = `${data.ServiceCoordinatorName}|${data.ServiceCoordinatorPhone}|${data.ServiceCoordinatorEmail}`;
  if (cache.has(key)) return cache.get(key);

  const query = {
    name: data.ServiceCoordinatorName || null,
    phone: formatPhoneNumber(String(data.ServiceCoordinatorPhone)) || null,
    email: data.ServiceCoordinatorEmail || null,
  };

  let coordinator = await Coordinator.findOne(query);
  if (!coordinator) coordinator = await Coordinator.create(query);

  cache.set(key, coordinator);
  return coordinator;
};

const getOrCreateInsurance = async (data, cache, mealPlan) => {
  const key = `${data.MAuthUnitsApproved}|${data.MCPT}|${data.MFrequency}|${data.PAuthUnitsApproved}|${data.PCPT}|${data.PFrequency}|${data.Note}|${mealPlan}`;
  if (cache.has(key)) return cache.get(key);

  const query = {
    m_auth_units_approved: data.MAuthUnitsApproved || "",
    mcpt: data.MCPT || "",
    m_frequency: data.MFrequency || "",
    p_auth_units_approved: data.PAuthUnitsApproved || "",
    pcpt: data.PCPT || "",
    p_frequency: data.PFrequency || "",
    note: data.Note || "",
    mealPlan: mealPlan || ""
  };

  let insurance = await Insurance.findOne(query);
  if (!insurance) insurance = await Insurance.create(query);

  cache.set(key, insurance);
  return insurance;
};

// Function to find or create a Coordinator based on the combination of details
const findOrCreateCoordinator = async (data) => { 
  const coordinator = await Coordinator.findOne({
    name: data.name || null,
    phone: formatPhoneNumber(String(data.phone)) || null,
    email: data.email || null,
  });
  if (coordinator) {
    return coordinator;
  } else {
    return await Coordinator.create({
      name: data.name || null,
      phone: formatPhoneNumber(String(data.phone)) || null,
      email: data.email || null,
    });
  } 
};

// Function to find or create an Insurance entry based on the combination of details
const findOrCreateInsurance = async (data) => { 
  const insurance = await Insurance.findOne({
    m_auth_units_approved: data.m_auth_units_approved || "",
    mcpt: data.mcpt || "",
    m_frequency: data.m_frequency || "",
    p_auth_units_approved: data.p_auth_units_approved || "",
    pcpt: data.pcpt || "",
    p_frequency: data.p_frequency || "",
    note: data.note || "",
    mealPlan: data.mealPlan || ""
  });
  if (insurance) {
    return insurance;
  } else {
    return await Insurance.create({
      m_auth_units_approved: data.m_auth_units_approved || "",
      mcpt: data.mcpt || "",
      m_frequency: data.m_frequency || "",
      p_auth_units_approved: data.p_auth_units_approved || "",
      pcpt: data.pcpt || "",
      p_frequency: data.p_frequency || "",
      note: data.note || "",
      mealPlan: data.mealPlan || ""
    });
  } 
};

const formatPhoneNumber = (phoneNumber) => {
  let value = phoneNumber.replace(/\D/g, '');
  if (value.length > 10) {
    value = value.slice(0, 10);
  }
  if (value.length === 10) {
    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
  }

  return value;
};

const extractTotalFromNote = (note) => {
  if (!note) return null;
  const match = note.match(/Tot-(\d+(\.\d+)?)/);
  return match ? parseFloat(match[1]) : 0;
};
 
const sendNotification = async (title, body, fcmToken, imgURL) => {
  try { 
    if (!fcmToken) {
      logger.error("fcm token not found");
      return;
    }

    // Prepare the notification message
    const message = {
        notification: {
            title,
            body,
            image: imgURL || "https://th.bing.com/th/id/OIP.EechjPY-pLkDkMm1m7Jd7QHaHa?rs=1&pid=ImgDetMain",
        },
        token: fcmToken
    };

    // Log the message only in development
    // if (config.env !== "production") {
    //   console.log("Sending notification:", message);
    // }

    // Send the notification
    const response = await firebaseConfig.messaging().send(message);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error); 
    return;
  }
};

const sendSMS = async (body) => {
    let { to, message } = body;
    // to = to.replace(/\D/g, '')           // removes non-numeric chars
    //      .replace(/^1/, '')           // removes leading 1 if already there
    //      .replace(/^/, '+1');

    let msgOptions = {
      from: config.twilioFromNum,
      to: to,
      body: message
    }
    try {
      const message = await twilioClient.messages.create(msgOptions); 
    }
    catch (error) {
      console.error(error);
    }
}

const getCoordinatesFromAddress = async (address) => {
  const encodedAddress = encodeURIComponent(address);
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodedAddress}&key=${config.google_map_key}`;
  const response = await axios.get(url);
  const data = response.data;
  if (data.status === 'OK') {
    const location = data.results[0].geometry.location;
    return {
      type: 'Point',
      coordinates: [location.lng, location.lat], // GeoJSON format
    };
  } else {
    throw new Error(`Address not found: ${data.status}`);
  }
}

function isAddressEqual(addr1, addr2) {
  const a1 = normalizeAddress(addr1);
  const a2 = normalizeAddress(addr2);

  return (
    a1.street1 === a2.street1 &&
    a1.street2 === a2.street2 &&
    a1.city === a2.city &&
    a1.state === a2.state &&
    a1.zip === a2.zip
  );
}

function normalizeAddress(address) {
  return {
    street1: normalizeString(address.street1),
    street2: normalizeString(address.street2),
    city: normalizeString(address.city),
    state: normalizeString(address.state),
    zip: normalizeString(address.zip)
  };
}

function normalizeString(str = '') {
  return str
    .toLowerCase()
    .trim()
    .replace(/[.,]/g, '') // remove periods and commas
    .replace(/\s+/g, ' '); // collapse multiple spaces
}

// const haversineDistance = (lat1, lon1, lat2, lon2) => {
//   const R = 6371000;  // Earth radius in meters
//   const toRad = angle => (angle * Math.PI) / 180;

//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);

//   const a =
//     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
//     Math.cos(toRad(lat1)) *
//       Math.cos(toRad(lat2)) *
//       Math.sin(dLon / 2) *
//       Math.sin(dLon / 2);

//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
//   return R * c;
// };

const haversineDistance = (lat1, lon1, lat2, lon2) => {
  const toRad = deg => (deg * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getStopNumber = (originalIndex, deliveryStops, optimizedOrder) => {
  // If optimizedOrder is empty OR if current index is the last point (final destination)
  if (!optimizedOrder.length || originalIndex === deliveryStops.length - 1) {
    return deliveryStops.length;  // Last stop
  }
  const positionInOptimized = optimizedOrder.indexOf(originalIndex);
  return positionInOptimized >= 0 ? positionInOptimized + 1 : deliveryStops.length;
};

// const getStopNumber = async (index, orderCoordinates, optimizedOrder) => {
//   const newIndex = optimizedOrder.findIndex(optIdx => optIdx === index);
//   return newIndex !== -1 ? newIndex + 1 : index + 1;
// };

 
const convertAudioToMP3 = async (audioBuffer, inputFormat = 'wav', outputFileName = 'converted') => {
  // Validate input
  if (!audioBuffer || !Buffer.isBuffer(audioBuffer)) {
    throw new Error('Invalid audio buffer provided');
  }

  // Create temporary files
  const tempDir = os.tmpdir();
  const inputPath = path.join(tempDir, `input_${Date.now()}.${inputFormat}`);
  const outputPath = path.join(tempDir, `${outputFileName}_${Date.now()}.mp3`);

  try {
    // Write input buffer to temporary file
    await writeFile(inputPath, audioBuffer);

    // Configure FFmpeg command
    const command = ffmpeg(inputPath)
      .audioCodec('libmp3lame')
      .audioBitrate(128)
      .audioChannels(1)
      .audioFrequency(22050)
      .outputOptions([
        '-id3v2_version', '3', // Better ID3 tag support
        '-write_xing', '0'     // Disable Xing header (better streaming)
      ]);

    // Special handling for different formats
    switch (inputFormat) {
      case 'aac':
        command.inputFormat('aac').outputOptions('-strict experimental');
        break;
      case 'm4a':
      case 'mp4':
        // For m4a/mp4, let FFmpeg auto-detect or use 'mp4'
        // command.inputFormat('mp4'); // optional, usually not needed
        break;
      case 'mp3':
        command.audioCodec('copy');
        break;
      case 'wav':
        command.inputFormat('wav');
        break;
      default:
        command.inputFormat(inputFormat);
    }


    // Execute conversion
    await new Promise((resolve, reject) => {
      command
        .on('start', (commandLine) => {
          console.log('FFmpeg command:', commandLine);
        })
        .on('codecData', (data) => {
          console.log('Input format:', data.format);
          console.log('Input audio codec:', data.audio);
        })
        .on('progress', (progress) => {
          console.log(`Processing: ${Math.round(progress.percent)}% done`);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err.message);
          reject(new Error(`FFmpeg processing failed: ${err.message}`));
        })
        .on('end', () => {
          console.log('Conversion finished successfully');
          resolve();
        })
        .save(outputPath);
    });

    // Read the converted file
    const mp3Buffer = await readFile(outputPath);

    return mp3Buffer;
  } catch (error) {
    console.error('Conversion error:', error);
    throw error;
  } finally {
    // Clean up temporary files
    try {
      await Promise.all([
        fs.existsSync(inputPath) ? unlink(inputPath) : Promise.resolve(),
        fs.existsSync(outputPath) ? unlink(outputPath) : Promise.resolve()
      ]);
    } catch (cleanupError) {
      console.error('Error cleaning up temp files:', cleanupError);
    }
  }
};

const getAudioFormatFromMimeType = (mimeType) => {
  const mimeToFormat = {
  'audio/wav': 'wav',
  'audio/x-wav': 'wav',
  'audio/aac': 'aac',
  'audio/mp4': 'mp4',      // <-- fix here
  'audio/x-m4a': 'm4a',
  'audio/3gpp': '3gp',
  'audio/ogg': 'ogg',
  'audio/webm': 'webm',
  'audio/mpeg': 'mp3',
  'audio/mp3': 'mp3'
};
  
  return mimeToFormat[mimeType] || 'wav';
};
 
const isAudioMimeType = (mimeType) => {
  return mimeType && mimeType.startsWith('audio/');
};

const convertToUniversalAudio = async (fileBuffer, mimeType, outputFileName = 'audio', fileName = '') => {
  if (!fileBuffer || !Buffer.isBuffer(fileBuffer)) {
    throw new Error('Invalid audio buffer provided');
  }
  const FileType = require('file-type');
  let type = await FileType.fromBuffer(fileBuffer);

  // Fallback to provided mimeType and fileName if file-type fails
  if (!type && mimeType && fileName) {
    type = {
      mime: mimeType,
      ext: fileName.split('.').pop()
    };
  }

  // Accept audio/*, video/mp4, and video/webm (for web dashboard)
  if (
    !type ||
    (
      !type.mime.startsWith('audio/') &&
      type.mime !== 'video/mp4' &&
      type.mime !== 'video/webm'
    )
  ) {
    throw new Error('Invalid or unsupported audio file.');
  }

  let processedBuffer = fileBuffer;
  let finalMimeType = 'audio/mpeg';
  let finalExtension = 'mp3';

  // Convert if not already mp3
  if (
    type.mime !== 'audio/mpeg' &&
    type.mime !== 'audio/mp3'
  ) {
    // For video/mp4 or video/webm, treat as mp4/webm
    const inputFormat =
      type.mime === 'video/mp4'
        ? 'mp4'
        : type.mime === 'video/webm'
        ? 'webm'
        : getAudioFormatFromMimeType(type.mime);
    processedBuffer = await convertAudioToMP3(fileBuffer, inputFormat, outputFileName);
  }
  return {
    buffer: processedBuffer,
    mimetype: finalMimeType,
    extension: finalExtension
  };
};

// Utility function to determine vendor ID for any user in the hierarchy
const getVendorIdForUser = async (currentUser) => {
  // If user is admin, return null (show all data)
  if (currentUser.role.name === 'admin') {
    return null;
  }

  // If user is vendor, return their admin document ID
  if (currentUser.role.name === 'vendor') {
    const vendorAdmin = await Admin.findOne({ user: currentUser._id });
    return vendorAdmin?._id || null;
  }

  // For other users (managers, etc.), trace up the hierarchy to find vendor
  let currentUserId = currentUser._id;
  let maxIterations = 10; // Prevent infinite loops
  let iteration = 0;

  while (currentUserId && iteration < maxIterations) {
    const user = await User.findById(currentUserId).populate('role');
    if (!user) break;

    // If this user is a vendor, return their admin document ID
    if (user.role.name === 'vendor') {
      const vendorAdmin = await Admin.findOne({ user: user._id });
      return vendorAdmin?._id || null;
    }

    // If this user is admin, return null (show all data)
    if (user.role.name === 'admin') {
      return null;
    }

    // Move up to the parent user
    currentUserId = user.createdBy;
    iteration++;
  }

  // If we can't find a vendor or admin in the hierarchy, return null (show all data)
  return null;
};

// Helper: Remove permissions from child roles that parent no longer has
const syncChildRolePermissions = async (parentRoleId, parentPermissions) => {
  const childRoles = await Role.find({ parentRole: parentRoleId });

  for (const child of childRoles) {
    let updated = false;

    const updatedPermissions = child.permissions.map(childPerm => {
      const parentPerm = parentPermissions.find(p => p.page === childPerm.page);

      if (parentPerm) {
        // Keep only actions that exist in parent
        const allowedActions = childPerm.actions.filter(action =>
          parentPerm.actions.includes(action)
        );

        // If any actions were removed
        if (allowedActions.length !== childPerm.actions.length) {
          updated = true;
        }

        return {
          page: childPerm.page,
          actions: allowedActions
        };
      } else {
        // Parent no longer has this page permission, remove it entirely
        updated = true;
        return null;
      }
    }).filter(Boolean); // remove nulls

    // Only save if changes were made
    if (updated) {
      child.permissions = updatedPermissions;
      await child.save();
    }

    // Recursively sync deeper descendants
    await syncChildRolePermissions(child._id, updatedPermissions);
  }
};

 
module.exports = { 
  generateRandomPassword, 
  generateUniqueUsername, 
  generateUniqueUsernameAndPasswordCustomer,
  sendAccountCreationEmail,
  sendPasswordResetOTPEmail,
  sendPasswordResetOTPEmailForRider,
  sendPasswordResetConfirmationEmail,
  formatDate,
  isCurrentMonthAndYear,
  combineAndSegregateRows,
  getOrCreateCoordinator,
  getOrCreateInsurance,
  findOrCreateCoordinator,
  findOrCreateInsurance,
  formatPhoneNumber,
  extractTotalFromNote, 
  sendNotification, 
  sendSMS,
  getCoordinatesFromAddress,
  isAddressEqual,
  haversineDistance,
  getStopNumber,
  convertAudioToMP3,
  getAudioFormatFromMimeType,
  isAudioMimeType,
  convertToUniversalAudio,
  getVendorIdForUser,
  syncChildRolePermissions
};
