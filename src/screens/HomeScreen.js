import React, { useState, useEffect } from "react";
import TopBar from "../components/TopBar/TopBar";
import CustomerForms from "../components/CustomerForms/CustomerForms";
import { db } from "../config/Firebase";
import { getDocs, collection, addDoc } from "firebase/firestore";
import Footer from "../components/Footer/Footer";
import { Snackbar } from "@mui/material";

const HomeScreen = () => {
   // State variables for managing form data and toast messages
  const [formFieldsData, setFormFieldsData] = useState([]);
  const [toastMsg, setToastMsg] = useState({
    showError: false,
    missingFields: [],
  });
  const [active, setActive] = useState(false);
  const [details, setDetails] = useState({});
  const [saveToast, setSaveToast] = useState(false);

    // Firestore collections
  const getDb = collection(db, "formData");
  const detailsDb = collection(db, "enquiryDetails");

    // Fetch form data from Firestore
  const getData = async () => {
    try {
      const data = await getDocs(getDb);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setFormFieldsData(filteredData[0].fields);
    } catch (err) {
      console.error(err);
    }
  };

  // Handlers for form data and active status
  const handleFormData = (data) => {
    setDetails(data);
  };
  const handleActiveStatus = (data) => {
    setActive(data);
  };

    // Function to submit data to Firestore
  const submitData = async () => {
    try {
      await addDoc(detailsDb, {
        details,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const resetFormData = () => {
    setDetails({}); // Resetting details to an empty object
    setActive(false); // Resetting active state if needed
    // Reset any other state as required
  };

    // Validate form details before submission
  const validateDetails = () => {
    const requiredFields = ["Customer Name", "Unit Number"];
    const missingFields = [];
    for (const field of requiredFields) {
      if (!details[field]) {
        missingFields.push(field);
      }
    }
    if (missingFields.length === 0) {
      setToastMsg((prev) => ({
        ...prev,
        showError: false,
      }));
      if (active) {
        submitData();
        setSaveToast(true);
        resetFormData()
      }
    } else {
      setToastMsg({
        showError: true,
        missingFields: missingFields,
      });
    }
    console.log(toastMsg);
  };

    // Handlers for toast messages
  const handleSave = () => {
    setSaveToast(false);
  };
  const handleToast = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setToastMsg({
      showError: false,
    });
  };

    // Fetch form data when the component mounts
  useEffect(() => {
    getData();
  }, []);





    // Render components: TopBar, CustomerForms, Footer, and Snackbar for notifications
  return (
    <div>
      <TopBar headerMessage={active} />
      <CustomerForms
        fields={formFieldsData}
        handleFormData={handleFormData}
        handleActiveStatus={handleActiveStatus}
      />
      <Footer saveData={validateDetails} />
      <Snackbar
        autoHideDuration={6000}
        open={toastMsg.showError}
        onClose={handleToast}
        message={`Please fill ${toastMsg.missingFields}`}
      />
      <Snackbar
        autoHideDuration={6000}
        message="Save Successful"
        open={saveToast}
        onClose={handleSave}
      />
    </div>
  );
};

export default HomeScreen;
