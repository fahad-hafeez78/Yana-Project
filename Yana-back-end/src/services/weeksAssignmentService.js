// const WeekAssignments = require('../models/WeekAssignments');
import WeekAssignments from "../models/WeekAssignments.js";
import moment from 'moment';

export const createWeeksAssignment = async (assignementData) => {
  try {
    // Initialize the assignment structure
    const weekAssignments = {
      week1: [],
      week2: [],
      week3: [],
      week4: [],
    };
    // Process each week in the received data
    Object.keys(assignementData.Activeweeks).forEach((weekKey) => {
      const week = assignementData.Activeweeks[weekKey]; // e.g., week1: [ [Object], [Object], ... ]

      // Map over the week's data and push structured assignments into the corresponding week key
      week.forEach((weekEntry) => {
        const structuredWeek = {
          Startdt: weekEntry.Startdt || "",
          Enddt: weekEntry.Enddt || "",
          Menus: weekEntry.Menus.map((menu) => ({
            MenuID: menu.MenuID,
            MenuName: menu.MenuName,
          })) || [],
        };

        // Add the structured week to the appropriate week key
        weekAssignments[weekKey].push(structuredWeek);
      });
    });

    // Save the week assignments into the database
    const newAssignment = await WeekAssignments.create(weekAssignments);
    return newAssignment;
  } catch (error) {
    throw new Error('Error creating week assignments: ' + error.message);
  }
};

// const moment = require("moment");
export const getAllWeeksAssignments = async () => {
  try {
    const assignments = await WeekAssignments.findOne();
    if (!assignments) {
      return [];
    }

    const today = moment(); // Get today's date
    const formattedAssignments = { week1: [], week2: [], week3: [], week4: [] };

    // Iterate through week1, week2, week3, week4
    let newWeekIndex = 1; // To assign to new weeks
    const weekKeys = ["week1", "week2", "week3", "week4"];

    weekKeys.forEach((weekKey) => {
      const weekData = assignments[weekKey] || [];
      const validWeeks = weekData.filter((week) => {
        const enddt = moment(week.Enddt, "MM-DD-YYYY");
        return today.isSameOrBefore(enddt, "day");
      });

      if (validWeeks.length > 0) {
        // Assign the valid week to the new formatted week key
        formattedAssignments[`week${newWeekIndex}`] = validWeeks;
        newWeekIndex++;
      }
    });

    // Reset remaining weeks to empty values
    for (let i = newWeekIndex; i <= 4; i++) {
      formattedAssignments[`week${i}`] = [
        { Startdt: "", Enddt: "", Menus: [] },
      ];
    }
    return formattedAssignments;
  } catch (error) {
    console.error("Error formatting assignments for frontend:", error.message);
    throw new Error("Error formatting assignments for frontend: " + error.message);
  }
};

  
export const updateWeeksAssignment = async (assignmentData) => {
  try {
    const updatedAssignments = [];
    const assignments = Array.isArray(assignmentData) ? assignmentData : [assignmentData];
    const { Activeweeks } = assignments[0];

    const existingAssignment = await WeekAssignments.findOne();

    if (!existingAssignment) {
      throw new Error("No existing assignments found.");
    }

    for (const weekKey in Activeweeks) {
      const newWeekData = Activeweeks[weekKey];

      if (Array.isArray(newWeekData) && newWeekData.length > 0) {
        // Replace the entire week's data if changes are detected
        existingAssignment[weekKey] = newWeekData;
      } else {
        console.warn(`No valid data found for ${weekKey}. Skipping update.`);
      }
    }

    const updatedAssignment = await existingAssignment.save();
    updatedAssignments.push(updatedAssignment);

    return updatedAssignments;
  } catch (error) {
    console.error("Error updating assignments:", error.message);
    throw new Error("Error updating assignments: " + error.message);
  }
};