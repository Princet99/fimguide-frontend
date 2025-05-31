import React, { useState } from "react";
import UploadModal from "./UploadModal";
import HistoryModal from "./HistoryModal";
import "./FloatingButtonWithTable.css"; // Assuming you have a CSS file for styling

const FloatingActionButtons = (props) => {
  const { Loanno, selectedrole } = props.Loanno;
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const toggleUploadModal = () => {
    setShowUploadModal((prev) => !prev);
  };

  const toggleHistoryModal = () => {
    setShowHistoryModal((prev) => !prev);
  };

  return (
    <div className="floating-button-container">
      {/* Floating Button for Upload */}

      {/* <button
        className="floating-button upload-button"
        onClick={toggleUploadModal}
      >
        <i className="fa-solid fa-upload"></i>
      </button> */}

      {/* Floating Button for History */}
      {/* <button
        className="floating-button history-button"
        onClick={toggleHistoryModal}
      >
        <i className="fa-solid fa-history"></i>
      </button> */}

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal Loanno={Loanno} onClose={toggleUploadModal} />
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <HistoryModal
          Loanno={Loanno}
          selectedrole={selectedrole}
          onClose={toggleHistoryModal}
        />
      )}
    </div>
  );
};

export default FloatingActionButtons;
