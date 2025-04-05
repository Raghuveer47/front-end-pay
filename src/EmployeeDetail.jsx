import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function EmployeeDetail() {
  const pdfRef = useRef()
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState([]);
  const [attendances, setAttendances] = useState([]);
  const [attendanceDataFetched, setAttendanceDataFetched] = useState(false);
  const handleDownloadPdf = async () => {
    try {
      const response = await axios.get(`http://localhost:8081/api/v1/downloadpdf/${id}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Employee_Pay_Slip.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Download error:", error);
    }
  };
  
  useEffect(() => {
    axios.get(`http://localhost:8081/api/v1/get/${id}`)
      .then(res => {
        setEmployee(res.data.Result);
        axios.get(`http://localhost:8081/api/v1/attendace?id=${res.data.Result._id}`)
          .then(res => {
            setAttendances(res.data.attenadnce);
            setAttendanceDataFetched(true); // Mark attendance data as fetched
            console.log(res.data);
          })
          .catch(err => console.log(err));
      })
      .catch(err => console.log(err));
  }, [id]);

  const handleLogout = () => {
    axios.get('http://localhost:8081/api/v1/logout', { withCredentials: true })
      .then(res => {
        if (res.data.Status === "Success") {
          console.log('Logout Successful');
          navigate('/'); // ✅ Redirect to login
        } else {
          console.log('Logout Failed:', res.data.Message);
        }
      })
      .catch(err => console.error('Logout Error:', err));
  };
  
  
  const downloadPDF = () => {

    const input = pdfRef.current;

    html2canvas(input).then((canvas) => {

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4', true);

      const pdfWidth = pdf.internal.pageSize.getWidth();

      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);

      const imgx = (pdfWidth - imgWidth * ratio) / 2;

      const imgY = 30;

      pdf.addImage(imgData, 'PNG', imgx, imgY, imgWidth * ratio, imgHeight * ratio); pdf.save('invoice.pdf');
    })
  }
  return (
    <div className="container py-4">
      <div className='pdf' ref={pdfRef}>

        <div className="d-flex  align-items-center my-5" style={{ gap: "100px" }}>
          <img
            src="https://res.cloudinary.com/dldubddug/image/upload/v1743750611/Datavalley_logo_Black-text_1_jkrc7y.jpg"
            alt="Employee"
            className='empImg'
               
          />
          <h2>Dear {employee.name}</h2>
        </div>
        <div className='d-flex  flex-sm-column flex-md-column flex-xl-row  justify-content-between  mb-4'>
          <div className="general">

            <div className='d-flex gap-2 flex-column mt-3'>
              <h2>General Information</h2>
              <h5>Name: {employee.name}</h5>
              <h5>Email: {employee.email}</h5>
              <h5>Salary: {employee.fixedctc}</h5>
            </div>
          </div>
          <div className="job_related d-flex gap-2 flex-column mt-3">
            <h2>Job Information</h2>
            <h5>Designation: {employee.designation}</h5>
            <h5>Date of Joined: {employee.dateofjoined}</h5>
            <h5>HRA: {employee.hraearn}</h5>
            <h5>BONUS: {employee.bonusearn}</h5>
          </div>
        </div>

      </div>
      <button className='btn btn-danger' style={{ position: "absolute", top: "30px", right: "30px" }} onClick={handleLogout}>Logout</button>
      <button className='btn btn-primary' onClick={handleDownloadPdf}>Download PDF</button>
      <div className='table-responsive mt-4'>
        <h2>Attendance History</h2>
        {attendanceDataFetched ? (
          <table className='table table-striped'>
            <thead>
              <tr>
                <th>History Id</th>
                <th>Name</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendances.map((attendance, index) => (
                <tr key={index}>
                  <td>{attendance._id}</td>
                  <td>{employee.name}</td>
                  <td>{attendance.date}</td>
                  <td
                    style={
                      attendance.status === "present"
                        ? { color: "green", fontWeight: "bold" }
                        : { color: "red", fontWeight: "bold" }
                    }
                  >
                    {attendance.status}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>Loading attendance data...</p>
        )}
      </div>
    </div>
  );
}

export default EmployeeDetail;
