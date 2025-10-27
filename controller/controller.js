require("dotenv").config(); 
const mongoose = require("mongoose");
const express = require('express');
const bcrypt = require('bcrypt');
const saltrounds = 10;
const session = require('express-session');
const { User,SeniorCitizen,Barangay ,PWD,Youth } = require("../model/schema");
const axios = require('axios');
const path = require("path");
const fs = require("fs");


exports.createUser = async (req, res) => {
    try {
        const { name, email, password, confirm_password, role } = req.body;

        console.log(name, email, password, confirm_password, role);
        if (!name || !email || !password || !confirm_password || role=="user") {
            return res.status(400).json({ 
                success: false,
                error: "All fields are required" 
            });
        }
     

        if (password !== confirm_password) {
            return res.status(400).json({ 
                success: false,
                error: "Passwords do not match" 
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                success: false,
                error: "Email already exists" 
            });
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, saltrounds);

        const newUser = new User({ 
            name, 
            email, 
            password: hashedPassword, // Store the hashed password
            role,
            status: "Active" // Default status
        });
        
        await newUser.save();

        // For security, don't return the hashed password in the response
        const userToReturn = { ...newUser._doc };
        delete userToReturn.password;

        res.status(201).json({ 
            success: true,
            message: "User created successfully", 
            user: userToReturn 
        });
    } catch (err) {
        res.status(400).json({ 
            success: false,
            error: err.message 
        });
    }
};

exports.login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Validate input
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          error: "All fields are required",
        });
      }
  
      // Check if user exists
      const user = await User.findOne({ email });
      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }

      if (user.status !== "Active") {
      return res.status(403).json({
        success: false,
        error: "Account is not active. Please contact the administrator.",
      });
    }
  
      // Verify password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: "Invalid credentials",
        });
      }
  
      // Store user data in session (excluding password)
      req.session.user = {
        _id: user._id,
        email: user.email,
        role: user.role,  // Ensure 'role' exists in your database
    };
    
      // Successful login response
      if (user.role === "Admin") {
        return res.redirect("/index");
    } else if (user.role === "Staff") {
        return res.redirect("/Pwd-form");
    }else if (user.role === "Super Admin") {
        return res.redirect("/index-superadmin");
    }else if (user.role === "Youth") {
        return res.redirect("/index-youth");
    }else {
        return res.redirect("/index"); // Default redirection
    }
  
    } catch (err) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
}

exports.logout = (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error('Session destruction error:', err);
        return res.redirect('/'); // Still redirect to root even on error
      }
      res.clearCookie('connect.sid'); // Clear the session cookie
      res.redirect('/'); // Explicit redirect to homepage
    });
  };


  //senior citizen form
  exports.createResident = async (req, res) => {
    console.log('Raw body:', req.body);
  
    try {
      const body = req.body;
  
      // Handle skill_other_text safely
      const skillOtherText = Array.isArray(body.education_hr_profile?.skill_other_text)
        ? body.education_hr_profile.skill_other_text.find(text => text && text.trim() !== '')
        : body.education_hr_profile?.skill_other_text;
  
      const residentData = {
        identifying_information: {
          name: {
            first_name: body.identifying_information?.name?.first_name,
            middle_name: body.identifying_information?.name?.middle_name,
            last_name: body.identifying_information?.name?.last_name
          },
          address: {
            barangay: body.identifying_information?.address?.barangay,
            purok: body.identifying_information?.address?.purok
          },
          date_of_birth: body.identifying_information?.date_of_birth,
          age: parseInt(body.identifying_information?.age) || 0,
          place_of_birth: Array.isArray(body.identifying_information?.place_of_birth)
            ? body.identifying_information.place_of_birth.filter(Boolean)
            : [body.identifying_information?.place_of_birth].filter(Boolean),
          marital_status: body.identifying_information?.marital_status,
          gender: body.identifying_information?.gender,
          contacts: Array.isArray(body.identifying_information?.contacts)
            ? body.identifying_information.contacts.filter(c => c?.name)
            : [],
          osca_id_number: body.identifying_information?.osca_id_number,
          gsis_sss: body.identifying_information?.gsis_sss,
          philhealth: body.identifying_information?.philhealth,
          sc_association_org_id_no: body.identifying_information?.sc_association_org_id_no,
          tin: body.identifying_information?.tin,
          other_govt_id: body.identifying_information?.other_govt_id,
          service_business_employment: body.identifying_information?.service_business_employment,
          current_pension: body.identifying_information?.current_pension,
          capability_to_travel: body.identifying_information?.capability_to_travel === 'Yes' ? 'Yes' : 'No'
        },
        family_composition: {
          spouse: {
            name: body.family_composition?.spouse?.name || undefined
          },
          father: {
            last_name: body.family_composition?.father?.last_name,
            first_name: body.family_composition?.father?.first_name,
            middle_name: body.family_composition?.father?.middle_name,
            extension: body.family_composition?.father?.extension || undefined
          },
          mother: {
            last_name: body.family_composition?.mother?.last_name,
            first_name: body.family_composition?.mother?.first_name,
            middle_name: body.family_composition?.mother?.middle_name
          },
          children: Array.isArray(body.family_composition?.children)
            ? body.family_composition.children
                .map(child => ({
                  full_name: child?.full_name || undefined,
                  occupation: child?.occupation || undefined,
                  age: parseInt(child?.age) || undefined,
                  working_status: child?.working_status || undefined,
                  income: child?.income || undefined
                }))
                .filter(child => child.full_name)
            : []
        },
        education_hr_profile: {
          educational_attainment: Array.isArray(body.education_hr_profile?.educational_attainment)
            ? body.education_hr_profile.educational_attainment.filter(Boolean)
            : [body.education_hr_profile?.educational_attainment].filter(Boolean),
          skills: Array.isArray(body.education_hr_profile?.skills)
            ? body.education_hr_profile.skills.filter(Boolean)
            : [],
          skill_other_text: skillOtherText || undefined
        }
      };
  
      const newResident = new SeniorCitizen(residentData);
      const savedResident = await newResident.save();
  
      res.status(201).json({
        success: true,
        alert: {
          title: 'Success!',
          text: 'Senior citizen record created successfully',
          icon: 'success',
          showConfirmButton: false,
          timer: 3000
        },
        data: savedResident,
        reference_code: savedResident.reference_code
      });
  
    } catch (error) {
      console.error('Error creating resident:', error);
  
      if (error.name === 'ValidationError') {
        const errors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        return res.status(400).json({
          success: false,
          alert: {
            title: 'Validation Error',
            text: 'Please check your input fields',
            icon: 'error',
            showConfirmButton: true
          },
          errors
        });
      }
  
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        return res.status(400).json({
          success: false,
          alert: {
            title: 'Duplicate Entry',
            text: `The ${field} already exists in our records`,
            icon: 'error',
            showConfirmButton: true
          },
          field,
          value: error.keyValue[field]
        });
      }
  
      res.status(500).json({
        success: false,
        alert: {
          title: 'Error',
          text: 'An unexpected error occurred',
          icon: 'error',
          showConfirmButton: true
        },
        error: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          stack: error.stack
        } : undefined
      });
    }
  };


exports.registerPwd = async (req, res) => {
  try {
    console.log('Raw body:', req.body);

    // Transform the raw data to match your schema
    const pwdData = {
      first_name: req.body.first_name,
      middle_name: req.body.middle_name,
      last_name: req.body.last_name,
      barangay: req.body.barangay,
      purok: req.body.purok,
      birthday: new Date(req.body.birthday), // Convert string to Date
      age: parseInt(req.body.age), // Ensure age is a number
      gender: req.body.gender,
      place_of_birth: req.body.place_of_birth,
      civil_status: req.body.civil_status,
      spouse_name: req.body.spouse_name,
      contacts: req.body.contacts,
      fatherLastName: req.body.fatherLastName,
      fatherFirstName: req.body.fatherFirstName,
      fatherMiddleName: req.body.fatherMiddleName,
      fatherExtension: req.body.fatherExtension,
      motherLastName: req.body.motherLastName,
      motherFirstName: req.body.motherFirstName,
      motherMiddleName: req.body.motherMiddleName,
      sss_id: req.body.sss_id,
      gsis_sss_no: req.body.gsis_sss_no,
      psn_no: req.body.psn_no,
      philhealth_no: req.body.philhealth_no,
      education_level: req.body.education_level,
      employment_status: req.body.employment_status,
      employment_category: req.body.employment_category,
      employment_type: req.body.employment_type,
      disability: req.body.disability,
      disability_other_text: req.body.disability_other_text,
      cause_disability: req.body.cause_disability,
      cause_other_text: req.body.cause_other_text
    };

    // Create new PWD document
    const newPwd = new PWD(pwdData);
    
    // Save to database
    const savedPwd = await newPwd.save();

    // Return success response
    res.status(201).json({
      success: true,
      message: 'PWD registration successful',
      data: savedPwd
    });

  } catch (err) {
    console.error('Registration error:', err);

    // Handle validation errors specifically
    if (err.name === 'ValidationError') {
      const errors = Object.values(err.errors).map(el => el.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    // Handle duplicate key errors (if you added unique constraints)
    if (err.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Duplicate key error',
        field: Object.keys(err.keyPattern)[0],
        error: `This ${Object.keys(err.keyPattern)[0]} is already registered`
      });
    }

    // Generic error handler
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      error: err.message
    });
  }
};

exports.updatePwd = async (req, res) => {
  try {
    console.log('Update PWD - Request body:', req.body);
    const { pwd_id, ...updateData } = req.body;
    
    console.log('PWD ID:', pwd_id);
    console.log('Update data:', updateData);
    console.log('Education level received:', updateData.education_level);
    console.log('Employment status received:', updateData.employment_status);
    
    if (!pwd_id) {
      return res.status(400).json({
        message: 'PWD ID is required',
        success: false
      });
    }

    // Convert birthday to Date object if provided
    if (updateData.birthday) {
      updateData.birthday = new Date(updateData.birthday);
    }

    // Convert age to number if provided
    if (updateData.age) {
      updateData.age = parseInt(updateData.age);
    }

    // Disability arrays are now sent directly as arrays from the frontend
    // No need to parse JSON strings since we're sending JSON data

    // Clean up empty strings and convert to null for optional fields only
    // Don't clean required fields to avoid validation errors
    const fieldsToClean = ['middle_name', 'place_of_birth', 'spouse_name', 
                          'fatherFirstName', 'fatherMiddleName', 'fatherLastName', 'fatherExtension',
                          'motherFirstName', 'motherMiddleName', 'motherLastName',
                          'employment_category', 'employment_type',
                          'disability_other_text', 'cause_other_text'];
    
    fieldsToClean.forEach(field => {
      if (updateData[field] === '' || updateData[field] === undefined) {
        updateData[field] = null;
      }
    });

    // Update the PWD record
    const updatedPwd = await PWD.findByIdAndUpdate(
      pwd_id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedPwd) {
      return res.status(404).json({
        message: 'PWD record not found',
        success: false
      });
    }

    res.status(200).json({
      message: 'PWD record updated successfully',
      data: updatedPwd,
      success: true
    });
  } catch (err) {
    console.error('Error updating PWD:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.errors,
        success: false
      });
    }

    res.status(500).json({
      message: 'Internal Server Error',
      success: false
    });
  }
};
  
// Analytics: OSCA (Senior Citizens) counts by barangay
exports.getOscaAnalytics = async (req, res) => {
  try {
    const results = await SeniorCitizen.aggregate([
      {
        $group: {
          _id: "$identifying_information.address.barangay",
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = results
      .filter(r => r._id)
      .map((r, idx) => ({ id: idx + 1, name: r._id, oscaCount: r.count }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('OSCA analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to load OSCA analytics' });
  }
};

// Analytics: PDAO (PWD) counts and gender breakdown by barangay
exports.getPdaoAnalytics = async (req, res) => {
  try {
    const results = await PWD.aggregate([
      {
        $group: {
          _id: "$barangay",
          pdaoCount: { $sum: 1 },
          maleCount: { $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] } },
          femaleCount: { $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const data = results
      .filter(r => r._id)
      .map((r, idx) => ({
        id: idx + 1,
        name: r._id,
        pdaoCount: r.pdaoCount,
        maleCount: r.maleCount,
        femaleCount: r.femaleCount
      }));

    res.json({ success: true, data });
  } catch (err) {
    console.error('PDAO analytics error:', err);
    res.status(500).json({ success: false, message: 'Failed to load PDAO analytics' });
  }
};

// Fetch barangays and their puroks from the database
async function fetchBarangays() {
  const barangayList = await Barangay.find({});

  if (!barangayList || barangayList.length === 0) {
    return null;
  }

  const puroks = {};
  barangayList.forEach(({ barangay, puroks: purokList }) => {
    puroks[barangay] = purokList;
  });

  return puroks;
}

exports.renderSeniorForm = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    const seniorCitizens = await SeniorCitizen.find({});

    if (!seniorCitizens) {
      return res.status(404).send('No barangays found');
    }

    if (!barangays) {
      return res.status(404).send('No barangays found');
    }

    // Pass the barangays data to the EJS template
    res.render('staff/staff_senior', {
      barangays: barangays || {},
      seniorCitizens: seniorCitizens || {}
    });
  } catch (err) {
    console.error('Error fetching barangays:', err);
    res.status(500).send('Internal Server Error');
  }
  };

exports.updateSenior = async (req, res) => {
  try {
    const { residentId, ...updateData } = req.body;
    
    if (!residentId) {
      return res.status(400).json({
        success: false,
        error: "Resident ID is required"
      });
    }

    // Build the update object based on the nested structure
    const updateObject = {};

    // Handle identifying_information fields
    if (updateData.first_name || updateData.middle_name || updateData.last_name) {
      updateObject['identifying_information.name.first_name'] = updateData.first_name;
      updateObject['identifying_information.name.middle_name'] = updateData.middle_name;
      updateObject['identifying_information.name.last_name'] = updateData.last_name;
    }

    if (updateData.barangay || updateData.purok) {
      updateObject['identifying_information.address.barangay'] = updateData.barangay;
      updateObject['identifying_information.address.purok'] = updateData.purok;
    }

    if (updateData.gender) {
      updateObject['identifying_information.gender'] = updateData.gender;
    }

    if (updateData.birthday) {
      updateObject['identifying_information.date_of_birth'] = new Date(updateData.birthday);
    }

    if (updateData.age) {
      updateObject['identifying_information.age'] = parseInt(updateData.age);
    }

    if (updateData.marital_status) {
      updateObject['identifying_information.marital_status'] = updateData.marital_status;
    }

    if (updateData.place_of_birth) {
      updateObject['identifying_information.place_of_birth'] = updateData.place_of_birth;
    }

    // Handle ID information
    if (updateData.osca_id) {
      updateObject['identifying_information.osca_id_number'] = updateData.osca_id;
    }

    if (updateData.gsis_sss) {
      updateObject['identifying_information.gsis_sss'] = updateData.gsis_sss;
    }

    if (updateData.philhealth) {
      updateObject['identifying_information.philhealth'] = updateData.philhealth;
    }

    if (updateData.tin) {
      updateObject['identifying_information.tin'] = updateData.tin;
    }

    // Handle family composition
    if (updateData.father_name) {
      const fatherParts = updateData.father_name.trim().split(' ');
      if (fatherParts.length >= 2) {
        updateObject['family_composition.father.first_name'] = fatherParts[0];
        updateObject['family_composition.father.last_name'] = fatherParts[fatherParts.length - 1];
        if (fatherParts.length > 2) {
          updateObject['family_composition.father.middle_name'] = fatherParts.slice(1, -1).join(' ');
        }
      }
    }

    if (updateData.mother_name) {
      const motherParts = updateData.mother_name.trim().split(' ');
      if (motherParts.length >= 2) {
        updateObject['family_composition.mother.first_name'] = motherParts[0];
        updateObject['family_composition.mother.last_name'] = motherParts[motherParts.length - 1];
        if (motherParts.length > 2) {
          updateObject['family_composition.mother.middle_name'] = motherParts.slice(1, -1).join(' ');
        }
      }
    }

    if (updateData.spouse_name && updateData.marital_status === 'Married') {
      updateObject['family_composition.spouse.name'] = updateData.spouse_name;
    }

    // Handle contacts
    if (updateData.contacts && Array.isArray(updateData.contacts)) {
      updateObject['identifying_information.contacts'] = updateData.contacts.filter(contact => 
        contact.name && contact.name.trim() !== ''
      );
    }

    console.log('Update object:', updateObject);

    // Update the senior citizen record
    const updatedSenior = await SeniorCitizen.findByIdAndUpdate(
      residentId,
      { $set: updateObject },
      { new: true, runValidators: true }
    );

    if (!updatedSenior) {
      return res.status(404).json({
        success: false,
        error: "Senior citizen not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Senior citizen updated successfully",
      data: updatedSenior
    });

  } catch (error) {
    console.error('Error updating senior citizen:', error);
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error"
    });
  }
};

  exports.renderPWDForm = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    const pwd = await PWD.find({});

 
    // Pass the barangays data to the EJS template
    res.render('staff/staff_pwd', {
      barangays: barangays || {},
      pwds: pwd || {}
    });
  } catch (err) {
    console.error('Error fetching barangays:', err);
    res.status(500).send('Internal Server Error');
  }
  };

  exports.renderAddSenior = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    
    if (!barangays) {
      return res.status(404).send('No barangays found');
    }
  
    // Pass the barangays data to the EJS template
    
    res.render('staff/staff_addSenior', {
      barangays: barangays || {},
    });
  } catch (err) {
    console.error('Error fetching barangays:', err);
    res.status(500).send('Internal Server Error');
  }
  };

   exports.renderAddPWD = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    // if (!barangays) {
    //   return res.status(404).send('No barangays found');
    // }
  
    // Pass the barangays data to the EJS template
   
    res.render('staff/staff_addPwd', {
      barangays: barangays || {}
    });
  } catch (err) {
    console.error('Error fetching barangays:', err);
    res.status(500).send('Internal Server Error');
  }
  };

   exports.renderSuperAdminUser = async (req, res) => {
 try {
   const users = await User.find({});
    if (!users) {
      //to change
      console.log('No users found');
    }
  
    // Pass the barangays data to the EJS template
   
    res.render('superadmin/superadmin_users', {
      users: users || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  };

   exports.renderSuperAdminIndex = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    
    // if (!barangays) {
    //   return res.status(404).send('No barangays found');
    // }
  
    // Pass the barangays data to the EJS template
   
    res.render('superadmin/admin_super_admin', {
      barangays: barangays || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  };

    exports.renderYouthForm = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    
    // if (!barangays) {
    //   return res.status(404).send('No barangays found');
    // }
  
    // Pass the barangays data to the EJS template
   
    res.render('youth/staff_youth_add', {
      barangays: barangays || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  };
  
exports.renderSuperAdminIndex = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    
    if (!barangays) {
      return res.status(404).send('No barangays found');
    }
  
    // Pass the barangays data to the EJS template
   
    res.render('superadmin/admin_super_admin', {
      barangays: barangays || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  };

exports.renderYouth = async (req, res) => {
 try {
    const barangays = await fetchBarangays();
    const youthData = await Youth.find({});

    console.log(youthData);
    // if (!barangays) {
    //   return res.status(404).send('No barangays found');
    // }
  
    // Pass the barangays data to the EJS template
   
    res.render('youth/staff_youth', {
      barangays: barangays || {},
      youths: youthData || {}
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
  };



exports.createYouth = async (req, res) => {
  try {
    console.log('Raw body:', req.body);

    // Destructure req.body
    const {
      first_name,
      middle_name,
      last_name,
      barangay,
      purok,
      contact,
      birthday,
      age,
      gender,
      place_of_birth,
      education_level,
      registered_sk,
      voted_sk,
      registered_national,
      employment_status,
      employment_category,
      employment_type,
      Assembly,
      sk_times,
      reason,
      youth_classification,
      youth_other_text,
      youth_age_group,
      age_other_text
    } = req.body;

    // Create new Youth document
    const newYouth = new Youth({
      first_name,
      middle_name,
      last_name,
      barangay,
      purok,
      contact,
      birthday: new Date(birthday), // ensure Date type
      age: parseInt(age, 10), // ensure Number type
      gender,
      place_of_birth,
      education_level,
      registered_sk,
      voted_sk,
      registered_national,
      employment_status,
      employment_category: employment_category || null,
      employment_type: employment_type || null,
      Assembly,
      sk_times: sk_times || null,
      reason: reason || null,
      youth_classification,
      youth_classification_other: youth_other_text || null,
      youth_age_group,
      youth_age_group_other: age_other_text || null,
    });

    // Save to database
    const savedYouth = await newYouth.save();

    res.status(201).json({
      message: 'Youth record created successfully',
      data: savedYouth
    });
  } catch (err) {
    console.error(err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.errors
      });
    }

    res.status(500).send('Internal Server Error');
  }
};

exports.updateYouth = async (req, res) => {
  try {
    console.log('Update Youth - Request body:', req.body);
    const { youthId, ...updateData } = req.body;
    
    console.log('Youth ID:', youthId);
    console.log('Update data:', updateData);
    
    if (!youthId) {
      return res.status(400).json({
        message: 'Youth ID is required',
        success: false
      });
    }

    // Convert birthday to Date object
    if (updateData.birthday) {
      updateData.birthday = new Date(updateData.birthday);
    }

    // Clean up empty strings and convert to null for optional fields
    const fieldsToClean = ['sk_times', 'reason', 'employment_category', 'employment_type', 'voted_sk', 'youth_classification_other', 'youth_age_group_other'];
    fieldsToClean.forEach(field => {
      if (updateData[field] === '' || updateData[field] === undefined) {
        updateData[field] = null;
      }
    });

    // Update the youth record
    const updatedYouth = await Youth.findByIdAndUpdate(
      youthId,
      updateData,
      { new: true, runValidators: true }
    );

    if (!updatedYouth) {
      return res.status(404).json({
        message: 'Youth record not found',
        success: false
      });
    }

    res.status(200).json({
      message: 'Youth record updated successfully',
      data: updatedYouth,
      success: true
    });
  } catch (err) {
    console.error('Error updating youth:', err);

    // Handle validation errors
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: err.errors,
        success: false
      });
    }

    res.status(500).json({
      message: 'Internal Server Error',
      success: false
    });
  }
};

// Send SMS via external API
exports.sendSms = async (req, res) => {

  try {
    const { recipients, message } = req.body;

    if (!process.env.API_TOKEN) {
      return res.status(500).json({ success: false, message: 'API_TOKEN not configured on server' });
    }

    if (!message || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return res.status(400).json({ success: false, message: 'Recipients and message are required' });
    }

    const apiUrl = 'https://sms.iprogtech.com/api/v1/sms_messages';

    const results = [];

    // Send messages sequentially to avoid rate issues; can be parallelized if needed
    for (const r of recipients) {
      const phone = r.phone || '';
      const name = r.name || '';

      if (!phone) {
        results.push({ phone, name, status: 'skipped', reason: 'no phone' });
        continue;
      }

      const body = {
        api_token: process.env.API_TOKEN,
        phone_number: phone,
        message: message
      };

      try {
        const resp = await axios.post(apiUrl, body, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 15000
        });

        // Log full response for debugging
        console.log(`SMS API response for ${phone}: status=${resp.status}`);
        console.log('headers:', resp.headers);
        console.log('data:', resp.data);

        results.push({ phone, name, status: 'sent', response: resp.data });
      } catch (err) {
        // Log detailed error
        if (err.response) {
          console.error(`SMS send error for ${phone}: status=${err.response.status}`, err.response.data);
        } else {
          console.error(`SMS send error for ${phone}:`, err.message);
        }
        results.push({ phone, name, status: 'error', error: err && err.response ? err.response.data : err.message });
      }
    }

    // If any send failed, return 503 so frontend can show service-down message
    const allSent = results.every(r => r.status === 'sent');
    if (allSent) {
      return res.status(200).json({ success: true, results });
    } else {
      return res.status(503).json({ success: false, message: 'SMS service is down at the moment', results });
    }
  } catch (err) {
    console.error('sendSms error:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getSilayBoundary = (req, res) => {
  try {
    const filePath = path.join(__dirname, "..", "files", "assets", "data", "Silay City.geojson");
    const geojson = JSON.parse(fs.readFileSync(filePath, "utf8"));
    res.json(geojson);
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to load Silay City boundary");
  }
};

exports.getVillages = (req, res) => {
  const villages = [
    { name: "Alegre", lat: 10.783000, lon: 123.054700 },
    { name: "Bagacay", lat: 10.761700, lon: 122.996600 },
    { name: "Bagtig", lat: 10.768600, lon: 123.040900 },
    { name: "Balaring", lat: 10.822500, lon: 122.960100 },
    { name: "Binonga", lat: 10.771900, lon: 122.981700 },
    { name: "Capitan Ramon", lat: 10.760200, lon: 123.114800 },
    { name: "Dalinzon", lat: 10.800000, lon: 123.100000 },
    { name: "Eustaquio Lopez", lat: 10.819500, lon: 123.041200 },
    { name: "Guimbalaon", lat: 10.755000, lon: 123.085400 },
    { name: "Guinhalaran", lat: 10.781100, lon: 122.966600 },
    { name: "Hacienda Cubay", lat: 10.788500, lon: 123.120800 },
    { name: "Hacienda Hinacayan", lat: 10.808600, lon: 123.074700 },
    { name: "Hacienda Kabungahan", lat: 10.803100, lon: 123.072200 },
    { name: "Hacienda Malisbog", lat: 10.807200, lon: 123.013900 },
    { name: "Hacienda Mansiquinon", lat: 10.746400, lon: 123.092100 },
    { name: "Hacienda Pula", lat: 10.803800, lon: 123.093600 },
    { name: "Imbang", lat: 10.796700, lon: 123.021300 },
    { name: "Kabankalan", lat: 10.819400, lon: 123.029100 },
    { name: "Lantad", lat: 10.815300, lon: 122.969900 },
    { name: "Macanig", lat: 10.781200, lon: 123.045400 },
    { name: "Macanig", lat: 10.798900, lon: 123.039800 },
    { name: "Magcorco", lat: 10.724150, lon: 123.174000 },
    { name: "Malinao", lat: 10.774300, lon: 123.105100 },
    { name: "Malisbog", lat: 10.829400, lon: 123.003200 },
    { name: "Mambulac", lat: 10.797500, lon: 122.967800 },
    { name: "Naga", lat: 10.778900, lon: 123.019600 },
    { name: "Napilas", lat: 10.768800, lon: 123.121400 },
    { name: "Navales", lat: 10.761950, lon: 123.152100 },
    { name: "Panaogao", lat: 10.792100, lon: 122.983400 },
    { name: "Quinilata", lat: 10.739800, lon: 123.111600 },
    { name: "Rizal", lat: 10.821200, lon: 122.978000 },
    { name: "San Juan", lat: 10.724300, lon: 123.135700 },
    { name: "Sangay", lat: 10.739700, lon: 123.102400 },
    { name: "Silay City", lat: 10.800300, lon: 122.976300 }
  ];

  res.json(villages);
};

// Debug endpoint to see what's in the database
exports.debugSeniorData = async (req, res) => {
  try {
    console.log('🔍 Debug: Fetching all senior data...');
    
    // Get all seniors with their barangay info
    const allSeniors = await SeniorCitizen.find({}, 'identifying_information.address.barangay identifying_information.name');
    
    // Get unique barangay names
    const uniqueBarangays = [...new Set(allSeniors.map(s => s.identifying_information.address.barangay).filter(Boolean))];
    
    // Count by barangay
    const counts = {};
    allSeniors.forEach(senior => {
      const barangay = senior.identifying_information.address.barangay;
      if (barangay) {
        counts[barangay] = (counts[barangay] || 0) + 1;
      }
    });
    
    res.json({
      success: true,
      totalSeniors: allSeniors.length,
      uniqueBarangays: uniqueBarangays,
      countsByBarangay: counts,
      sampleData: allSeniors.slice(0, 5).map(s => ({
        name: s.identifying_information.name,
        barangay: s.identifying_information.address.barangay
      }))
    });
  } catch (err) {
    console.error('❌ Debug error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get PWD count data by barangay for the map
exports.getPwdMapData = async (req, res) => {
  try {
    console.log('🔍 Fetching PWD data from database...');
    
    // First, let's see what barangay names are actually in the database
    const allPwds = await PWD.find({}, 'barangay first_name last_name');
    console.log('🔍 All barangay names in PWD database:', allPwds.map(p => p.barangay));
    
    // Get PWD count by barangay
    const pwdCounts = await PWD.aggregate([
      {
        $group: {
          _id: "$barangay",
          pwdCount: { $sum: 1 },
          maleCount: { $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] } },
          femaleCount: { $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📊 PWD counts from database:', pwdCounts);

    // Define barangay coordinates and other data - Updated to match database names
    const barangayData = [
      { name: "Barangay 1", lat: 10.80240, lon: 122.97624, population: 4200 },
      { name: "Barangay 2", lat: 10.79938, lon: 122.97828, population: 3750 },
      { name: "Barangay 3", lat: 10.79770, lon: 122.97281, population: 4800 },
      { name: "Barangay 4", lat: 10.78407, lon: 123.00921, population: 3200 },
      { name: "Barangay 5", lat: 10.78147, lon: 122.99145, population: 2650 },
      { name: "Barangay Mambulac", lat: 10.79754, lon: 122.9679, population: 2100 },
      { name: "Barangay Guinhalaran", lat: 10.7811, lon: 122.9666, population: 3100 },
      { name: "Barangay E-Lopez", lat: 10.82060, lon: 123.03538, population: 1800 },
      { name: "Barangay Bagtic", lat: 10.76204, lon: 123.05122, population: 2850 },
      { name: "Barangay Balaring", lat: 10.83171, lon: 122.96136, population: 1920 },
      { name: "Barangay Hawaiian", lat: 10.82606, lon: 123.00549, population: 3900 },
      { name: "Barangay Patag", lat: 10.72466, lon: 123.15720, population: 1200 },
      { name: "Barangay Kapt. Ramon", lat: 10.77394, lon: 123.11920, population: 1500 },
      { name: "Barangay Guimbalaon", lat: 10.75730, lon: 123.07857, population: 2300 },
      { name: "Barangay Rizal", lat: 10.79816, lon: 122.99473, population: 2800 },
      { name: "Barangay Lantad", lat: 10.80845, lon: 122.97199, population: 2400 }
    ];

    // Merge database counts with barangay data
    const result = barangayData.map(barangay => {
      // Try exact match first
      let countData = pwdCounts.find(item => item._id === barangay.name);
      let pwdCount = 0;
      let maleCount = 0;
      let femaleCount = 0;
      
      if (countData) {
        pwdCount = countData.pwdCount;
        maleCount = countData.maleCount;
        femaleCount = countData.femaleCount;
      } else {
        // Try case-insensitive match
        countData = pwdCounts.find(item => 
          item._id && item._id.toLowerCase() === barangay.name.toLowerCase()
        );
        if (countData) {
          pwdCount = countData.pwdCount;
          maleCount = countData.maleCount;
          femaleCount = countData.femaleCount;
        } else {
          // Try partial match for common variations
          countData = pwdCounts.find(item => {
            if (!item._id) return false;
            const dbName = item._id.toLowerCase();
            const mapName = barangay.name.toLowerCase();
            
            // Check for common variations
            return dbName.includes(mapName) || 
                   mapName.includes(dbName) ||
                   dbName.includes('hawaiian') && mapName.includes('hawaiian') ||
                   dbName.includes('poblacion') && mapName.includes('poblacion');
          });
          if (countData) {
            pwdCount = countData.pwdCount;
            maleCount = countData.maleCount;
            femaleCount = countData.femaleCount;
          }
        }
      }
      
      console.log(`📍 ${barangay.name}: ${pwdCount} PWDs (${maleCount}M, ${femaleCount}F) (matched with: ${countData ? countData._id : 'none'})`);
      
      return {
        ...barangay,
        pwdCount: pwdCount,
        maleCount: maleCount,
        femaleCount: femaleCount
      };
    });

    console.log('✅ Final PWD result with database data:', result);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error fetching PWD map data:', err);
    res.status(500).json({ success: false, message: 'Failed to load PWD map data' });
  }
};

// Get Youth count data by barangay for the map
exports.getYouthMapData = async (req, res) => {
  try {
    console.log('🔍 Fetching Youth data from database...');
    
    // First, let's see what barangay names are actually in the database
    const allYouths = await Youth.find({}, 'barangay first_name last_name');
    console.log('🔍 All barangay names in Youth database:', allYouths.map(y => y.barangay));
    
    // Get Youth count by barangay with additional breakdowns
    const youthCounts = await Youth.aggregate([
      {
        $group: {
          _id: "$barangay",
          youthCount: { $sum: 1 },
          maleCount: { $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] } },
          femaleCount: { $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] } },
          skRegistered: { $sum: { $cond: [{ $eq: ["$registered_sk", "Yes"] }, 1, 0] } },
          skVoted: { $sum: { $cond: [{ $eq: ["$voted_sk", "Yes"] }, 1, 0] } },
          nationalRegistered: { $sum: { $cond: [{ $eq: ["$registered_national", "Yes"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📊 Youth counts from database:', youthCounts);

    // Define barangay coordinates and other data - Updated to match database names
    const barangayData = [
      { name: "Barangay 1", lat: 10.80240, lon: 122.97624, population: 4200 },
      { name: "Barangay 2", lat: 10.79938, lon: 122.97828, population: 3750 },
      { name: "Barangay 3", lat: 10.79770, lon: 122.97281, population: 4800 },
      { name: "Barangay 4", lat: 10.78407, lon: 123.00921, population: 3200 },
      { name: "Barangay 5", lat: 10.78147, lon: 122.99145, population: 2650 },
      { name: "Barangay Mambulac", lat: 10.79754, lon: 122.9679, population: 2100 },
      { name: "Barangay Guinhalaran", lat: 10.7811, lon: 122.9666, population: 3100 },
      { name: "Barangay E-Lopez", lat: 10.82060, lon: 123.03538, population: 1800 },
      { name: "Barangay Bagtic", lat: 10.76204, lon: 123.05122, population: 2850 },
      { name: "Barangay Balaring", lat: 10.83171, lon: 122.96136, population: 1920 },
      { name: "Barangay Hawaiian", lat: 10.82606, lon: 123.00549, population: 3900 },
      { name: "Barangay Patag", lat: 10.72466, lon: 123.15720, population: 1200 },
      { name: "Barangay Kapt. Ramon", lat: 10.77394, lon: 123.11920, population: 1500 },
      { name: "Barangay Guimbalaon", lat: 10.75730, lon: 123.07857, population: 2300 },
      { name: "Barangay Rizal", lat: 10.79816, lon: 122.99473, population: 2800 },
      { name: "Barangay Lantad", lat: 10.80845, lon: 122.97199, population: 2400 }
    ];

    // Merge database counts with barangay data
    const result = barangayData.map(barangay => {
      // Try exact match first
      let countData = youthCounts.find(item => item._id === barangay.name);
      let youthCount = 0;
      let maleCount = 0;
      let femaleCount = 0;
      let skRegistered = 0;
      let skVoted = 0;
      let nationalRegistered = 0;
      
      if (countData) {
        youthCount = countData.youthCount;
        maleCount = countData.maleCount;
        femaleCount = countData.femaleCount;
        skRegistered = countData.skRegistered;
        skVoted = countData.skVoted;
        nationalRegistered = countData.nationalRegistered;
      } else {
        // Try case-insensitive match
        countData = youthCounts.find(item => 
          item._id && item._id.toLowerCase() === barangay.name.toLowerCase()
        );
        if (countData) {
          youthCount = countData.youthCount;
          maleCount = countData.maleCount;
          femaleCount = countData.femaleCount;
          skRegistered = countData.skRegistered;
          skVoted = countData.skVoted;
          nationalRegistered = countData.nationalRegistered;
        } else {
          // Try partial match for common variations
          countData = youthCounts.find(item => {
            if (!item._id) return false;
            const dbName = item._id.toLowerCase();
            const mapName = barangay.name.toLowerCase();
            
            // Check for common variations
            return dbName.includes(mapName) || 
                   mapName.includes(dbName) ||
                   dbName.includes('hawaiian') && mapName.includes('hawaiian') ||
                   dbName.includes('poblacion') && mapName.includes('poblacion');
          });
          if (countData) {
            youthCount = countData.youthCount;
            maleCount = countData.maleCount;
            femaleCount = countData.femaleCount;
            skRegistered = countData.skRegistered;
            skVoted = countData.skVoted;
            nationalRegistered = countData.nationalRegistered;
          }
        }
      }
      
      console.log(`📍 ${barangay.name}: ${youthCount} Youths (${maleCount}M, ${femaleCount}F) (SK: ${skRegistered} registered, ${skVoted} voted) (matched with: ${countData ? countData._id : 'none'})`);
      
      return {
        ...barangay,
        youthCount: youthCount,
        maleCount: maleCount,
        femaleCount: femaleCount,
        skRegistered: skRegistered,
        skVoted: skVoted,
        nationalRegistered: nationalRegistered
      };
    });

    console.log('✅ Final Youth result with database data:', result);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error fetching Youth map data:', err);
    res.status(500).json({ success: false, message: 'Failed to load Youth map data' });
  }
};

// Get Youth count per barangay for admin analytics
exports.getYouthAnalytics = async (req, res) => {
  try {
    console.log('🔍 Fetching Youth analytics data from database...');
    
    // Get Youth count by barangay
    const youthCounts = await Youth.aggregate([
      {
        $group: {
          _id: "$barangay",
          lydoCount: { $sum: 1 },
          maleCount: { $sum: { $cond: [{ $eq: ["$gender", "Male"] }, 1, 0] } },
          femaleCount: { $sum: { $cond: [{ $eq: ["$gender", "Female"] }, 1, 0] } },
          skRegistered: { $sum: { $cond: [{ $eq: ["$registered_sk", "Yes"] }, 1, 0] } },
          skVoted: { $sum: { $cond: [{ $eq: ["$voted_sk", "Yes"] }, 1, 0] } },
          nationalRegistered: { $sum: { $cond: [{ $eq: ["$registered_national", "Yes"] }, 1, 0] } }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📊 Youth counts from database:', youthCounts);

    // Define all barangays in Silay City (matching the map data)
    const allBarangays = [
      "Barangay 1", "Barangay 2", "Barangay 3", "Barangay 4", "Barangay 5",
      "Barangay Mambulac", "Barangay Guinhalaran", "Barangay E-Lopez", "Barangay Bagtic",
      "Barangay Balaring", "Barangay Hawaiian", "Barangay Patag",
      "Barangay Kapt. Ramon", "Barangay Guimbalaon", "Barangay Rizal", "Barangay Lantad"
    ];

    // Create result array with all barangays, including those with 0 count
    const result = allBarangays.map((barangayName, index) => {
      const countData = youthCounts.find(item => 
        item._id && item._id.toLowerCase() === barangayName.toLowerCase()
      );
      
      return {
        id: index + 1,
        name: barangayName,
        lydoCount: countData ? countData.lydoCount : 0,
        maleCount: countData ? countData.maleCount : 0,
        femaleCount: countData ? countData.femaleCount : 0,
        skRegistered: countData ? countData.skRegistered : 0,
        skVoted: countData ? countData.skVoted : 0,
        nationalRegistered: countData ? countData.nationalRegistered : 0
      };
    });

    // Calculate totals
    const totalLYDO = result.reduce((sum, item) => sum + item.lydoCount, 0);
    const totalBarangays = result.length;
    const averageLYDO = totalBarangays > 0 ? Math.round(totalLYDO / totalBarangays) : 0;

    console.log('✅ Youth analytics data prepared:', { totalLYDO, totalBarangays, averageLYDO });

    res.json({ 
      success: true, 
      data: {
        barangays: result,
        totalLYDO,
        totalBarangays,
        averageLYDO
      }
    });
  } catch (err) {
    console.error('❌ Error fetching Youth analytics data:', err);
    res.status(500).json({ success: false, message: 'Failed to load Youth analytics data' });
  }
};

// Get senior count data by barangay for the map
exports.getSeniorMapData = async (req, res) => {
  try {
    console.log('🔍 Fetching senior data from database...');
    
    // First, let's see what barangay names are actually in the database
    const allSeniors = await SeniorCitizen.find({}, 'identifying_information.address.barangay');
    console.log('🔍 All barangay names in database:', allSeniors.map(s => s.identifying_information.address.barangay));
    
    // Get senior count by barangay
    const seniorCounts = await SeniorCitizen.aggregate([
      {
        $group: {
          _id: "$identifying_information.address.barangay",
          seniorCount: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    console.log('📊 Senior counts from database:', seniorCounts);

    // Define barangay coordinates and other data - Updated to match database names
    const barangayData = [
      { name: "Barangay 1", lat: 10.80240, lon: 122.97624, population: 4200 },
      { name: "Barangay 2", lat: 10.79938, lon: 122.97828, population: 3750 },
      { name: "Barangay 3", lat: 10.79770, lon: 122.97281, population: 4800 },
      { name: "Barangay 4", lat: 10.78407, lon: 123.00921, population: 3200 },
      { name: "Barangay 5", lat: 10.78147, lon: 122.99145, population: 2650 },
      { name: "Barangay Mambulac", lat: 10.79754, lon: 122.9679, population: 2100 },
      { name: "Barangay Guinhalaran", lat: 10.7811, lon: 122.9666, population: 3100 },
      { name: "Barangay E-Lopez", lat: 10.82060, lon: 123.03538, population: 1800 },
      { name: "Barangay Bagtic", lat: 10.76204, lon: 123.05122, population: 2850 },
      { name: "Barangay Balaring", lat: 10.83171, lon: 122.96136, population: 1920 },
      { name: "Barangay Hawaiian", lat: 10.82606, lon: 123.00549, population: 3900 },
      { name: "Barangay Patag", lat: 10.72466, lon: 123.15720, population: 1200 },
      { name: "Barangay Kapt. Ramon", lat: 10.77394, lon: 123.11920, population: 1500 },
      { name: "Barangay Guimbalaon", lat: 10.75730, lon: 123.07857, population: 2300 },
      { name: "Barangay Rizal", lat: 10.79816, lon: 122.99473, population: 2800 },
      { name: "Barangay Lantad", lat: 10.80845, lon: 122.97199, population: 2400 }
    ];

    // Merge database counts with barangay data
    const result = barangayData.map(barangay => {
      // Try exact match first
      let countData = seniorCounts.find(item => item._id === barangay.name);
      let seniorCount = 0;
      
      if (countData) {
        seniorCount = countData.seniorCount;
      } else {
        // Try case-insensitive match
        countData = seniorCounts.find(item => 
          item._id && item._id.toLowerCase() === barangay.name.toLowerCase()
        );
        if (countData) {
          seniorCount = countData.seniorCount;
        } else {
          // Try partial match for common variations
          countData = seniorCounts.find(item => {
            if (!item._id) return false;
            const dbName = item._id.toLowerCase();
            const mapName = barangay.name.toLowerCase();
            
            // Check for common variations
            return dbName.includes(mapName) || 
                   mapName.includes(dbName) ||
                   dbName.includes('hawaiian') && mapName.includes('hawaiian') ||
                   dbName.includes('poblacion') && mapName.includes('poblacion');
          });
          if (countData) {
            seniorCount = countData.seniorCount;
          }
        }
      }
      
      console.log(`📍 ${barangay.name}: ${seniorCount} seniors (matched with: ${countData ? countData._id : 'none'})`);
      
      return {
        ...barangay,
        seniorCount: seniorCount
      };
    });

    console.log('✅ Final result with database data:', result);
    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ Error fetching senior map data:', err);
    res.status(500).json({ success: false, message: 'Failed to load senior map data' });
  }
};


exports.editUserStatus = async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const existing = await User.findById(id);
    if (!existing) {
      return res.status(404).json({ message: 'User not found' });
    }

    const nextStatus = existing.status === 'Inactive' ? 'Active' : 'Inactive';
    await User.findByIdAndUpdate(id, { status: nextStatus }, { new: true });
    return res.redirect('/superadmin-users');
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id, name, email, role, status, password, confirm_password } = req.body;

    if (!id) {
      return res.status(400).json({ message: 'User id is required' });
    }

    const update = {};
    if (name) update.name = name;
    if (email) update.email = email;
    if (role) update.role = role;
    if (status) update.status = status;

    if (password || confirm_password) {
      if (!password || !confirm_password) {
        return res.status(400).json({ message: 'Both password and confirm_password are required' });
      }
      if (password !== confirm_password) {
        return res.status(400).json({ message: 'Passwords do not match' });
      }
      const hashedPassword = await bcrypt.hash(password, saltrounds);
      update.password = hashedPassword;
    }

    if (Object.keys(update).length === 0) {
      return res.redirect('/superadmin-users');
    }

    try {
      const updatedUser = await User.findByIdAndUpdate(id, update, { new: true });
      if (!updatedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
      return res.redirect('/superadmin-users');
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};



