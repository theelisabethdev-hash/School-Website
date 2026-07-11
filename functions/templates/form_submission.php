<?php 
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
if(isset($_POST['submit']))
{
include('admin/db.php');
	$sql_service = $conn->prepare("INSERT INTO tbl_form_submission (pdf_doc,per_name,per_email,per_mobile,payement_image,per_date_time,trans_id,document,doe) VALUES (? , ?, ?, ? ,? ,? ,?, ? ,?)");  
		$per_name= $_POST['per_name'];
		$per_email= $_POST['per_email'];
		$per_mobile= $_POST['per_mobile'];
		$per_date_time= $_POST['per_date_time'];
		$trans_id = $_POST['trans_id'];
		$tdate =date("m-d-Y");
			if(!empty($_FILES["pdf_doc"]["name"]))
		{
		$allowedExts_logo_image = array("pdf");
		 $path = $_FILES['pdf_doc']['name'];      
       $extension = pathinfo($path, PATHINFO_EXTENSION);
	
		$ram_logo_image1=rand(0000,9999);
		$news_pdf1=$ram_logo_image1.$_FILES["pdf_doc"]["name"];
		
		$uploaddir_logo_image1 = 'uploads/pdf_doc/';
		$uploadfile_logo_image1 = $uploaddir_logo_image1 . basename($news_pdf1);
	    if (in_array($extension, $allowedExts_logo_image))
		{
			if(move_uploaded_file($_FILES['pdf_doc']['tmp_name'], $uploadfile_logo_image1))
			{
			  $logo_image2='uploads/pdf_doc/'.$ram_logo_image1.$_FILES["pdf_doc"]["name"];
			}
		}
		
		}
		if(!empty($_FILES["image"]["name"]))
		{
	
		$ram_logo_image=rand(0000,9999);
		$news_pdf=$ram_logo_image.$_FILES["image"]["name"];
		
		$uploaddir_logo_image = 'uploads/payement_images/';
		$uploadfile_logo_image = $uploaddir_logo_image . basename($news_pdf);
			if(move_uploaded_file($_FILES['image']['tmp_name'], $uploadfile_logo_image))
			{
			  $logo_image1='uploads/payement_images/'.$ram_logo_image.$_FILES["image"]["name"];
			}
		}
	
		if(!empty($_FILES["document"]["name"]))
		{
		$allowedExts_logo_image1 = array("pdf");
		 $path1 = $_FILES['document']['name'];      
       $extension1 = pathinfo($path1, PATHINFO_EXTENSION);
	
		$ram_logo_image2=rand(0000,9999);
		$news_pdf2=$ram_logo_image2.$_FILES["document"]["name"];
		
		$uploaddir_logo_image2 = 'uploads/pdf_doc/';
		$uploadfile_logo_image2 = $uploaddir_logo_image2 . basename($news_pdf2);
	    if (in_array($extension1, $allowedExts_logo_image1))
		{
			if(move_uploaded_file($_FILES['document']['tmp_name'], $uploadfile_logo_image2))
			{
			  $logo_image3='uploads/pdf_doc/'.$ram_logo_image2.$_FILES["document"]["name"];
			}
		}
		
		}
		$sql_service->bind_param("sssssssss", $logo_image2,$per_name,$per_email,$per_mobile,$logo_image1,$per_date_time,$trans_id,$logo_image3,$tdate); 
		if($sql_service->execute()) {
		$msg = "<b style='color:#61c100;'>Added Form  Submission  Successfully</b>";
		} else {
		$msg = "<b style='color:#d70000;'>Problem in AddingForm  Submission</b>";
		}
		$sql_service->close(); 
}	
		
?>
<!DOCTYPE html>
<html lang="en" id="ls-global">

<!-- Mirrored from theelisabethgaubaschool.com/Registration.aspx by HTTrack Website Copier/3.x [XR&CO'2014], Tue, 22 Nov 2022 16:14:02 GMT -->
<!-- Added by HTTrack --><meta http-equiv="content-type" content="text/html;charset=utf-8" /><!-- /Added by HTTrack -->
<head><meta http-equiv="Content-Type" content="text/html; charset=UTF-8" /><title>
	Student Registration Form
</title><link href="favicon.ico" rel="shortcut icon" type="image/x-icon" /><meta name="viewport" content="width=device-width" /><link rel="shortcut icon" type="image/x-icon" href="images/logo.html" /><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" /><meta http-equiv="content-type" content="text/html; charset=UTF-8" /><meta name="description" content="The Elisabeth Gauba School, Shiv Niketan School, Best School Near Connaught Place, School near Gole Market, Nursery Admissions in Shiv Niketan School, One Of The Best School, Facilities with best academics,sports &amp; co-curricular, CBSC school, .Elisabeth Gauba School, The Elisabeth Gauba School in Delhi, best schools of Gole Market, best school near RML hospital delhi, 
            best schools in delhi, Gole Market best school, best cbse schools near rk ashram delhi, cbse schools in NCR, school near RML hospital, RML hospital near cbse school in Delhi, Delhi best school, best cbse schools in Delhi The Elisabeth Gauba School." /><meta name="keywords" content="The Elisabeth Gauba School in Delhi, best schools of Gole Market, best school near RML hospital delhi, best schools in delhi, Gole Market best school, best cbse schools near rk ashram delhi, cbse schools in NCR, school near RML hospital, RML hospital near cbse school in Delhi, Delhi best school, best cbse schools in Delhi The Elisabeth Gauba School.
           The Elisabeth Gauba School, Shiv Niketan School, Best School Near Connaught Place, School near Gole Market, Nursery Admissions in Shiv Niketan School, One Of The Best School, Facilities with best academics,sports &amp; co-curricular, CBSC school, Elisabeth Gauba School." /><meta name="author" content="GrayGrids" /><link href="http://fonts.googleapis.com/css?family=Roboto+Condensed:300,300i,400,400i,700,700i" rel="stylesheet" /><link href="http://fonts.googleapis.com/css?family=Lato:100,100i,300,300i,400,400i,700,700i,900,900i" rel="stylesheet" /><link href="css/bootstrap.css" rel="stylesheet" type="text/css" media="all" /><link rel="stylesheet" href="css/bootstrap.min.css" type="text/css" media="screen" /><link href="css/font-awesome.css" rel="stylesheet" /><link href="css/owl.theme.css" rel="stylesheet" /><link href="css/style.css" rel="stylesheet" type="text/css" media="all" /><link href="css/ChooseUs.css" rel="stylesheet" /><link href="css/simpleLightbox.css" rel="stylesheet" type="text/css" /><link rel="stylesheet" href="css/owl.carousel.css" type="text/css" media="all" /><link rel="stylesheet" href="css/MainMenu.css" media="all" /><link href="css/News.css" rel="stylesheet" media="all" /></head>
<body>
   

<script type="text/javascript">
//<![CDATA[
var theForm = document.forms['ctl01'];
if (!theForm) {
    theForm = document.ctl01;
}
function __doPostBack(eventTarget, eventArgument) {
    if (!theForm.onsubmit || (theForm.onsubmit() != false)) {
        theForm.__EVENTTARGET.value = eventTarget;
        theForm.__EVENTARGUMENT.value = eventArgument;
        theForm.submit();
    }
}
//]]>
</script>


<script src="WebResource9772.js?d=gBKv8hI6DdQPo8hQwWEf3DHRpcHLUFXG93igZRryrt-judDCMjbev3sFDjaKqCrZX5h50tUBf7Jimm0Mn2iqZHbqdjIw-Eo1-unhyOLfvzw1&amp;t=637811927229275428" type="text/javascript"></script>


<script src="ScriptResource4300.js?d=TMtW8BZEfa3nX4XQGKmoReeqBxm4jivwtqsfJqvaBRgarSeQp_byiblSwNv_qKzpgRr-Bng-dSAUi7DUlpH6fa9Q6NV8KAfLVaJv8ukSgCoX8s6IQMNGGcwO6Yfd2zaO0DKEJjhM-idQlJymmEru3gCvTDSmefOS2rRYoWc1w5onaTY-b3pMvYNLdNMmieNs0&amp;t=ffffffffaa493ab8" type="text/javascript"></script>
<script type="text/javascript">
//<![CDATA[
if (typeof(Sys) === 'undefined') throw new Error('ASP.NET Ajax client-side framework failed to load.');
//]]>
</script>

<script src="ScriptResource590b.js?d=ejZajSXgjaaGO71c7ZDgHhgTZCcCEmY8-FIxPq0PnPUNkHKPywtJ_wEJD4t38pMjdq4XPKI5Sz8RheuXQRW8BakZ0fMD3AqsJa5VXDkrZC19Q366T6YNF2vT0tsz5a1BadFaCE2U-MTd9K9QyWjPWDosKnv6ZkpyFxKMuQaO4eLtRm9CtQ0ELR_zRIWyehpY0&amp;t=ffffffffaa493ab8" type="text/javascript"></script>
<script src="WebResourcea8fb.js?d=ej4NC34WLC3j3RXufoXcdhsCXpSNtUVElMGw56evOG2n0DmDKJ2Wm83ImNjZkM8OX-7Ubks9kX0ae6lisGkHTFhanRrl2mxxmjXg0yBzR1g1&amp;t=637811927229275428" type="text/javascript"></script>
<div class="aspNetHidden">

	<input type="hidden" name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="0E6B69E9" />
	<input type="hidden" name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="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" />
</div>
        <script type="text/javascript" src="js/jquery-2.1.4.min.js"></script>
        <script type="text/javascript" src="js/numscroller-1.0.js"></script>
	    <script src="js/slick.js" type="text/javascript"></script>	    
        <script type="text/javascript" src="js/move-top.js"></script>
        <script type="text/javascript" src="js/easing.js"></script>
        <script src="js/simpleLightbox.js"></script>
        <script src="js/bootstrap.js"></script>
        <script src="js/Schoolscript.js"></script>
	    <script src="js/owl.carousel.js"></script>
        <script  src="js/jquery.MainMenu.js"></script>
        <script src="js/Validation.js"></script>
        <script src="js/jcarousellite.html"></script>

        <div class="header row">
            	
            <div class="col-md-11 col-xs-9 text-center">    
            
                <a href="index.html" class="" style="float:none;display:inline-block">
                    <img src="images/logo_desktop.png" class="img-responsive" />
                </a>
               
			
			
            </div>
            <div  class="col-md-1 col-xs-3" style="float:right; margin-top:20px;">
            	    <a href="https://m.facebook.com/TheElisabethGaubaSchool" target="_blank">
               <i style="font-size: 30px;" class="fa fa-facebook-square" aria-hidden="true"></i>  
                </a>&nbsp;
                <a href="https://www.instagram.com/theelisabethgaubaschool/" target="_blank">
                  <i style="font-size: 30px;" class="fa fa-instagram" aria-hidden="true"></i>
                </a>
            	</div>
        </div>

        <div class="main_header_area" >
            
            <div class="col-md-12 text-center">
                <header>
                    <div class="main_menu_area">
                        <div class="mainmenu">
                            <nav style="display: block;">
                                <ul id="nav" style="font-size: 8px;">
                                    <li></li>
                                    <li class="current_page_item"><a href="index.html">Home</a></li>
                                    <li><a href="#">About Us<i class="fa fa-caret-down"></i></a>
                                        <ul class="sub-menu">
                                            <li><a href="AboutUs.html">About Us</a></li>
                                            <li><a href="Schoolhistory.html">History Of School</a></li>
                                            <li><a href="AboutSociety.html">About Society</a></li>
                                            <li><a href="Objective.html">Objective</a></li>
                                            <li><a href="Mission.html">Mission</a></li>
                                            
                                        </ul>
                                    </li>
                                    <li><a href="#">School Management<i class="fa fa-caret-down"></i></a>
                                        <ul class="sub-menu">
                                            <li><a href="Chairperson.html">Message from our Chairperson</a></li>
                                            <li><a href="Principal.html">Message from the Principal's Desk</a></li>
                                            <li><a href="Committee.html">Executive Committee</a></li>
                                            <li><a href="teachingstaff.html">Staff Members</a>
                                            </li>
                                        </ul>
                                    </li>
                                    <li><a href="#">Curriculum<i class="fa fa-caret-down"></i></a>
                                        <ul class="sub-menu">
                                            <li><a href="Approach.html">Approach</a></li>
                                            <li><a href="AcademicCalendar.html">Academic Calendar</a></li>
                                            <li><a href="Curricular.html">Co-Curricular</a></li>
                                            <li><a href="SchoolInfrastructure.html">Facilities & Infrastructure</a></li>
                                            <li><a href="Security.html">Safety & Security</a></li>
                                            <li><a href="SocialConsciouness.html">School With Social Consciouness</a></li>
                                        </ul>
                                    </li>
                                    <li><a href="#">Admissions<i class="fa fa-caret-down"></i></a>
                                        <ul class="sub-menu">
                                            <li><a href="AdmissionProcess.html">Admission Process & Requirements</a></li>
                                            <li><a href="Registration.html">Online Registration</a></li>
                                            <li><a href="FeeStructure.html">Fee Structure and Payment</a></li>
                                            <li><a href="SchoolTiming.html">School Timing</a></li>
                                        </ul>
                                    </li>
                                    
                                    <li><a href="#">Useful Links<i class="fa fa-caret-down"></i></a>
                                        <ul class="sub-menu">
                                             <li><a href="Pandemic.html">Online/pandemic learning</a></li>
                                            <li><a href="Vacancies.html">Vacancy</a></li>
                                            <li><a href="News.html">Notices</a></li>
                                            <li><a href="Gallery.html">Photo Gallery</a></li>
                                            <li><a href="AnualEvents.html">Activities</a></li>                                           
                                        </ul>
                                    </li>
                                    <li><a href="ContactUs.html">Contact Us</a></li>
                                </ul>
                            </nav>
                        </div>
                    </div>
                </header>
            </div>
        </div>

        <div id="body">

            <div class="modal hide fade" id="myModal">
                  <div class="modal-header">
                    <a class="close" data-dismiss="modal">×</a>
                    <h3>Modal header</h3>
                  </div>
                  <div class="modal-body">
                    <p>One fine body…</p>
                  </div>
                  <div class="modal-footer">
                    <a href="#" class="btn">Close</a>
                    <a href="#" class="btn btn-primary">Save changes</a>
                  </div>
        </div>

            

            <section class="content-wrapper main-content clear-fix">
                
    <script type="text/javascript">
//<![CDATA[
Sys.WebForms.PageRequestManager._initialize('ctl00$MainContent$script', 'ctl01', [], [], [], 90, 'ctl00');
//]]>
</script>

      <script type="text/javascript" src="../code.jquery.com/jquery-1.11.3.min.js"></script>
    <script type="text/javascript" src="../cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/js/bootstrap-datepicker.min.js"></script>
    <link rel="stylesheet" href="../cdnjs.cloudflare.com/ajax/libs/bootstrap-datepicker/1.4.1/css/bootstrap-datepicker3.css"/>
    
   

    <script>
        $(document).ready(function () {
            var date_input = $('input[name="StudentdateDOB"]'); //our date input has the name "date"
            var container = $('.bootstrap-iso form').length > 0 ? $('.bootstrap-iso form').parent() : "body";
            date_input.datepicker({
                format: 'dd/mm/yyyy',
                container: container,
                todayHighlight: true,
                autoclose: true,
            })
        })

    </script>
        <script type="text/javascript">

            function CheckValidation() {

                if (document.getElementById("MainContent_ddlRegistrationforClass").selectedIndex == 0) {
                    alert("Please select a Registration for Class");
                    document.getElementById("MainContent_ddlRegistrationforClass").focus();
                    return false;
                }
                else if (document.getElementById("MainContent_txtStudentName").value.trim() == "") {
                    alert("Please input Student Name");
                    document.getElementById("MainContent_txtStudentName").focus();
                    return false;
                }
                else if (document.getElementById("StudentdateDOB").value == "") {
                    alert("Please input the Date of Birth");
                    document.getElementById("StudentdateDOB").focus();
                    return false;
                }
                else if (document.getElementById("MainContent_DOBInWords").value.trim() == "") {
                    alert("Please input Date of birth in Words");
                    document.getElementById("MainContent_DOBInWords").focus();
                    return false;
                }

                else if (datevalidation() == false) {
                    document.getElementById("StudentdateDOB").focus();
                    return false;
                }
                    
                else if (GenderValidate() == false) {
                    return false;
                }
                
                else if (document.getElementById("MainContent_txtStudentNationality").value.trim() == "") {
                    alert("Please input Nationality");
                    document.getElementById("MainContent_txtStudentNationality").focus();
                    return false;
                }
                
                else if (document.getElementById("MainContent_MotherTongue").value.trim() == "") {
                    alert("Please input Mother Tongue");
                    document.getElementById("MainContent_MotherTongue").focus();
                    return false;
                }

                else if (CategoryValidate() == false) {
                    return false;
                }

                //Father Details
                else if (document.getElementById("MainContent_txtFatherName").value.trim() == "") {
                    alert("Please input Father Name");
                    document.getElementById("MainContent_txtFatherName").focus();
                    return false;
                }
                else if (document.getElementById("MainContent_txtFatherProfession").value.trim() == "") {
                    alert("Please input Father Profession");
                    document.getElementById("MainContent_txtFatherProfession").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtFatherResiAddress").value.trim() == "") {
                    alert("Please input Father Residential Address");
                    document.getElementById("MainContent_txtFatherResiAddress").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtFatherMob").value.trim() == "") {
                    alert("Please input Father Mobile No");
                    document.getElementById("MainContent_txtFatherMob").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtFatherEmailid").value.trim() == "") {
                    alert("Please input Father Email ID");
                    document.getElementById("MainContent_txtFatherEmailid").focus();
                    return false;
                }

                else if (EmailIdValidate(document.getElementById("MainContent_txtFatherEmailid").value) == false) {
                    document.getElementById("MainContent_txtFatherEmailid").focus();
                    return false;
                }
                
                    //Mother Details
                else if (document.getElementById("MainContent_txtMotherName").value.trim() == "") {
                    alert("Please input Mother Name");
                    document.getElementById("MainContent_txtMotherName").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtMotherResiAddress").value.trim() == "") {
                    alert("Please input Mother Residential Address");
                    document.getElementById("MainContent_txtMotherResiAddress").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtMotherMob").value.trim() == "") {
                    alert("Please input Mother Mobile No");
                    document.getElementById("MainContent_txtMotherMob").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtMotherEmailid").value.trim() == "") {
                    alert("Please input Mother Email ID");
                    document.getElementById("MainContent_txtMotherEmailid").focus();
                    return false;
                }
                else if (EmailIdValidate(document.getElementById("MainContent_txtMotherEmailid").value) == false) {
                    document.getElementById("MainContent_txtMotherEmailid").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtGuardianName").value.trim() == "") {
                    alert("Please input Guardian Name");
                    document.getElementById("MainContent_txtGuardianName").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtGuardianchildRelation").value.trim() == "") {
                    alert("Please input Relation with the child");
                    document.getElementById("MainContent_txtGuardianchildRelation").focus();
                    return false;
                }

                else if (document.getElementById("MainContent_txtGuardianEmailid").value.trim() != "") {
                    if (EmailIdValidate(document.getElementById("MainContent_txtGuardianEmailid").value) == false) {
                        document.getElementById("MainContent_txtGuardianEmailid").focus();
                        return false;
                    }
                } 

                var conf = confirm("Are you sure you want to continue ");
                if (conf == true) {
                    return true;
                }
                else { return false; }
            }

            function datevalidation() {
                date = document.getElementById("StudentdateDOB").value;

                if (date.length < 10) {
                    alert('Invalid Date. Please enter a valid date.');
                    return false;
                }
                var DD = date.substring(0, 2);
                var MM = date.substring(3, 5);
                var YYYY = date.substring(6, 10);
                var text_date = new Date(DD + "/" + MM + "/" + YYYY);
                if (text_date == "NaN") {
                    alert('Please Enter date in (dd/mm/yyyy) format Only');
                    return false;
                }
                else if (MM > 12) {
                    alert('Month should not be greater than 12 ');
                    return false;
                }
                else if (DD > 31) {
                    alert('Date should not be more than 31 ');
                    return false;
                }
                else { return true; }
            }

            function EmailIdValidate(emailid) {

                var emailPat = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
                var matchArray = emailid.match(emailPat);
                if (matchArray == null) {
                    alert("Your email address seems incorrect. Please try again.");
                    return false;
                }
            }

            function GenderValidate() {
                var rb = document.getElementById("MainContent_StudentGender");
                var radio = rb.getElementsByTagName("input");
                var isChecked = false;
                for (var i = 0; i < radio.length; i++) {
                    if (radio[i].checked) {
                        isChecked = true;
                        break;
                    }
                }
                if (!isChecked) {
                    alert("Please select Gender");
                    return false;
                }
                return isChecked;
            }

            function CategoryValidate() {
                var rb = document.getElementById("MainContent_rblStudentCatagory");
                var radio = rb.getElementsByTagName("input");
                var isChecked = false;
                for (var i = 0; i < radio.length; i++) {
                    if (radio[i].checked) {
                        isChecked = true;
                        break;
                    }
                }
                if (!isChecked) {
                    alert("Please select Student Catagory");
                    return false;
                }
                return isChecked;
            }

            function isNumber(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (charCode > 31 && (charCode < 48 || charCode > 57)) {
                    return false;
                }
                return true;
            }

            $(document).ready(function () {
                //Disable cut copy paste
                $('body').bind('cut copy paste', function (e) {
                    e.preventDefault();
                });

                //Disable mouse right click
                $("body").on("contextmenu", function (e) {
                    return false;
                });
            });

            function isAlphaNumeric(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (!(charCode > 47 && charCode < 58) && // numeric (0-9)
                       (charCode != 32) && // space, 110 decimal, 188 equal sign, 189= dash
                        (charCode != 46) &&
                       !(charCode > 64 && charCode < 91) && // upper alpha (A-Z)
                       !(charCode > 96 && charCode < 123)) { // lower alpha (a-z)
                    return false;
                }
                return true;
            };
            function isAlphaNumericWithSpcl(evt) {
                evt = (evt) ? evt : window.event;
                var charCode = (evt.which) ? evt.which : evt.keyCode;
                if (!(charCode > 47 && charCode < 58) && // numeric (0-9)
                       (charCode != 32) && // space, 110 decimal, 188 equal sign, 189= dash
                        (charCode != 46) &&
                        (charCode != 58) && (charCode != 59) && (charCode != 13) && (charCode != 45) &&
                        (charCode != 38) && (charCode != 44) && (charCode != 92) &&
                        (charCode != 64) && (charCode != 40) && (charCode != 41) && 
                       !(charCode > 64 && charCode < 91) && // upper alpha (A-Z)
                       !(charCode > 96 && charCode < 123)) { // lower alpha (a-z)
                    return false;
                }
                return true;
            };


            function SelectIndexChange(Obj) {
                var retval
                if (Obj == "rblstudentsibling") {
                    retval = $('#MainContent_rblstudentsibling input[type=radio]:checked').val();
                    if (retval == "Yes") {
                        document.getElementById("MainContent_txtsiblingName").disabled = false;
                        document.getElementById("MainContent_txtsiblingName").focus();
                        document.getElementById("MainContent_txtsiblingName").value = "";
                        document.getElementById("MainContent_txtsiblingClassSection").disabled = false;
                        document.getElementById("MainContent_txtsiblingClassSection").value = "";
                    }
                    else {
                        document.getElementById("MainContent_txtsiblingName").disabled = true;
                        document.getElementById("MainContent_txtsiblingName").value = "";
                        document.getElementById("MainContent_txtsiblingClassSection").disabled = true;
                        document.getElementById("MainContent_txtsiblingClassSection").value = "";
                    }
                }

                if (Obj == "rblsStudentLastSchool") {
                    retval = $('#MainContent_rblsStudentLastSchool input[type=radio]:checked').val();
                    if (retval == "Yes") {
                        document.getElementById("MainContent_LastSchoolName").disabled = false;
                        document.getElementById("MainContent_LastSchoolName").focus();
                        document.getElementById("MainContent_LastSchoolName").value = "";
                        document.getElementById("MainContent_LastSchoolAddress").disabled = false;
                        document.getElementById("MainContent_LastSchoolAddress").value = "";
                    }
                    else {
                        document.getElementById("MainContent_LastSchoolName").disabled = true;
                        document.getElementById("MainContent_LastSchoolName").value = "";
                        document.getElementById("MainContent_LastSchoolAddress").disabled = true;
                        document.getElementById("MainContent_LastSchoolAddress").value = "";
                    }
                }

                if (Obj == "rblSpecialNeed") {
                    retval = $('#MainContent_rblSpecialNeed input[type=radio]:checked').val();
                    if (retval == "Yes") {
                        document.getElementById("MainContent_txtMedicalCertificates").disabled = false;
                        document.getElementById("MainContent_txtMedicalCertificates").value = "";
                        document.getElementById("MainContent_txtMedicalCertificates").focus();
                    }
                    else {
                        document.getElementById("MainContent_txtMedicalCertificates").value = "";
                        document.getElementById("MainContent_txtMedicalCertificates").disabled = true;
                    }
                }


                if (Obj == "rblAllergy") {
                    retval = $('#MainContent_rblAllergy input[type=radio]:checked').val();
                    if (retval == "Yes") {
                        document.getElementById("MainContent_txtAllergyspecify").disabled = false;
                        document.getElementById("MainContent_txtAllergyspecify").value = "";
                        document.getElementById("MainContent_txtAllergyspecify").focus();
                    }
                    else {
                        document.getElementById("MainContent_txtAllergyspecify").value = "";
                        document.getElementById("MainContent_txtAllergyspecify").disabled = true;
                    }
                }
            }

            window.onload = function () {
                document.getElementById("MainContent_txtsiblingName").disabled = true;
                document.getElementById("MainContent_txtsiblingName").value = "";
                document.getElementById("MainContent_txtsiblingClassSection").disabled = true;
                document.getElementById("MainContent_txtsiblingClassSection").value = "";

                document.getElementById("MainContent_LastSchoolName").disabled = true;
                document.getElementById("MainContent_LastSchoolName").value = "";
                document.getElementById("MainContent_LastSchoolAddress").disabled = true;
                document.getElementById("MainContent_LastSchoolAddress").value = "";

                document.getElementById("MainContent_txtMedicalCertificates").value = "";
                document.getElementById("MainContent_txtMedicalCertificates").disabled = true;
                document.getElementById("MainContent_txtAllergyspecify").value = "";
                document.getElementById("MainContent_txtAllergyspecify").disabled = true;
            };


        </script>

    <div class="popular-section-wthree">
        <div class="container">
            <div class="wthree-heading">
                <h2 class="Contact_header">Form Submission </h2>
            </div> 

           
            

            
            <fieldset class="scheduler-border col-md-12 col-xs-12 left">
                <legend class="scheduler-border legendName">
                    <label class="labelfont">Details:</label>
                    <span>fill all the  details</span>
                </legend>
                <?php if(!empty($msg)) {
                 echo $msg;
                ?>
                <?php } ?>
                 <form method="post" action="" id="" enctype="multipart/form-data" >
                <div class="row">
                    <div class="col-md-12">
                       <div class="col-md-12">
                            <div class="control-group form-group">
                                <label class="labelfont">Registration Form Pdf Upload<span class="Redcolor">*</span></label>
                                <input required name="pdf_doc" accept=".pdf" type="file" id="" value="" maxlength="20"   tabindex="3" class="form-control pull-right MandetoryField" Placeholder="Registration Date" required="" />
                                <p class="help-block"></p>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="control-group form-group">
                                 <div class="controls">
                                    <label class="labelfont">Name<span class="Redcolor">*</span></label> 
                                    <input required name="per_name" type="text" value="" maxlength="20"  id="" tabindex="2" class="form-control pull-right MandetoryField" Placeholder="Full Name" required="" />
                                    <p class="help-block"></p>
                                </div>
                            </div>	
                        </div>
                        <div class="col-md-12">
                            <div class="control-group form-group">
                                 <div class="controls">
                                    <label class="labelfont">Email<span class="Redcolor">*</span></label> 
                                    <input required name="per_email" type="email" value="" maxlength=""  id="" tabindex="2" class="form-control pull-right MandetoryField" Placeholder="Email Id" required="" />
                                    <p class="help-block"></p>
                                </div>
                            </div>	
                        </div>
                        <div class="col-md-12">
                            <div class="control-group form-group">
                                <div class="controls">
                                    <label class="labelfont">Mobile Number<span class="Redcolor">*</span></label> 
                                    <input required name="per_mobile" type="text" value="" maxlength="20"  id="" tabindex="2" class="form-control pull-right MandetoryField" Placeholder="Mobile Number" required="" />
                                    <p class="help-block"></p>
                                </div>
                            </div>	
                        </div>
                        <div class="col-md-12">
                            <div class="control-group form-group">
                                <label class="labelfont">Payement Screenshot (jpg/png image)<span class="Redcolor">*</span></label>
                                <input required name="image" type="file" id="" value="" maxlength=""   tabindex="3" class="form-control pull-right MandetoryField" Placeholder="" required="" />
                                <p class="help-block"></p>
                            </div>
                        </div>
                         <div class="col-md-12">
                            <div class="control-group form-group">
                                <div class="controls">
                                    <label class="labelfont">Transaction number<span class="Redcolor">*</span></label> 
                                    <input required name="trans_id" type="text" value="" maxlength=""  id="" tabindex="2" class="form-control pull-right MandetoryField" Placeholder="Transaction numbe" required="" />
                                    <p class="help-block"></p>
                                </div>
                            </div>	
                        </div>
                         <div class="col-md-12">
                            <div class="control-group form-group">
                                <label class="labelfont">Upload Document (Upto 15MB)<span class="Redcolor">*</span></label>
                                <input required name="document" accept=".pdf" type="file" id="" value="" maxlength=""   tabindex="3" class="form-control pull-right MandetoryField" Placeholder="" required="" />
                                <p class="help-block"></p>
                            </div>
                        </div>
                        <div class="col-md-12">
                            <div class="control-group form-group">
                                <div class="controls">
                                    <label class="labelfont">Payement Date & time<span class="Redcolor">*</span></label> 
                                    <input required name="per_date_time" type="text" value="" maxlength=""  id="" tabindex="2" class="form-control pull-right MandetoryField" Placeholder="" required="" />
                                    <p class="help-block"></p>
                                </div>
                            </div>	
                        </div>
                        <br />
                     <div class="col-md-3" style="margin-top:10px;">
                     <button  type="submit" name="submit" id="" class="form-control btn btn-primary pull-right">Submit</button>
                     </div>
                    </div>
                    
                </div>
                </form>
            </fieldset>
           

            <div class="clearfix"></div>
            <div class="row">
                <div class="col-md-12">
                    &nbsp;
                </div>
            </div>

            <div class="row">
                <div class="col-md-12">
                    <div class="col-md-3">&nbsp;</div>
                    <div class="col-md-3">
                        
                    </div>
                    <div class="col-md-3">
                    </div>
                    <div class="col-md-3">&nbsp;</div>
                </div>
            </div>

        </div>
    </div>



            </section>
        </div>

        <footer>
         <div class="footer">
		<div class="container">
			<div class="col-md-3 agile_footer_grid">
				<h3>About Us</h3>
				<ul class="w3_address">
                    <li><a href="Schoolhistory.html">School History</a></li>
                    <li><a href="Mission.html">Mission</a></li>
				</ul>
			</div>
            <div class="col-md-3 agile_footer_grid">
				<h3>Curriculum</h3>
				<ul class="w3_address">
                   <li><a href="AcademicCalendar.html">Academic Calendar</a></li>
                   <li><a href="Approach.html">Approach</a></li>                   
				</ul>
			</div>
			<div class="col-md-4 agile_footer_grid">
                <h3>Curriculum</h3>
				<ul class="w3_address">
                    <li><a href="AdmissionProcess.html">Admissions and Eligibility</a></li>
                    <li><a href="FeeStructure.html">Fees Structure</a></li>              
				</ul>				 
			</div>
			<div class="col-md-2 agile_footer_grid">
				<h3>Useful Links</h3>
               
				<ul class="w3_address">
                    <li><a href="AnualEvents.html">Activities</a></li>
                    <li><a href="News.html">Notices</a></li>
                    <li><a href="Gallery.html">Gallery</a></li>
				</ul>	
			</div>
		</div>
	</div>
    <div class="agileinfo_copyright">
        <div class="container">
			<div class="col-md-1 agile_footer_grid">
				<a href="https://www.instagram.com/theelisabethgaubaschool/" target="_blank">
                <svg width="20" height="20" viewBox="0 0 36 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21.4453 17.5C21.4453 19.35 19.9028 20.8496 18 20.8496C16.0972 20.8496 14.5547 19.35 14.5547 17.5C14.5547 15.65 16.0972 14.1504 18 14.1504C19.9028 14.1504 21.4453 15.65 21.4453 17.5Z" fill="white"/>
                    <path d="M26.0574 11.5736C25.8918 11.1372 25.6275 10.7423 25.2842 10.4181C24.9508 10.0843 24.5448 9.82746 24.0958 9.66644C23.7316 9.52892 23.1844 9.36523 22.1767 9.32064C21.0866 9.27231 20.7598 9.26189 18 9.26189C15.24 9.26189 14.9131 9.27204 13.8233 9.32037C12.8156 9.36523 12.2682 9.52892 11.9042 9.66644C11.4552 9.82746 11.049 10.0843 10.7158 10.4181C10.3725 10.7423 10.1082 11.137 9.94235 11.5736C9.8009 11.9276 9.63254 12.4598 9.58667 13.4396C9.53696 14.4991 9.52625 14.8169 9.52625 17.5003C9.52625 20.1834 9.53696 20.5011 9.58667 21.561C9.63254 22.5407 9.8009 23.0726 9.94235 23.4267C10.1082 23.8633 10.3722 24.258 10.7155 24.5821C11.049 24.9159 11.4549 25.1728 11.904 25.3338C12.2682 25.4716 12.8156 25.6353 13.8233 25.6799C14.9131 25.7282 15.2397 25.7384 17.9997 25.7384C20.76 25.7384 21.0869 25.7282 22.1765 25.6799C23.1842 25.6353 23.7316 25.4716 24.0958 25.3338C24.9972 24.9958 25.7097 24.3031 26.0574 23.4267C26.1988 23.0726 26.3672 22.5407 26.4133 21.561C26.463 20.5011 26.4735 20.1834 26.4735 17.5003C26.4735 14.8169 26.463 14.4991 26.4133 13.4396C26.3675 12.4598 26.1991 11.9276 26.0574 11.5736ZM18 22.6601C15.0686 22.6601 12.6922 20.35 12.6922 17.5C12.6922 14.65 15.0686 12.3399 18 12.3399C20.9312 12.3399 23.3075 14.65 23.3075 17.5C23.3075 20.35 20.9312 22.6601 18 22.6601ZM23.5173 13.3418C22.8323 13.3418 22.277 12.8019 22.277 12.1359C22.277 11.47 22.8323 10.93 23.5173 10.93C24.2023 10.93 24.7577 11.47 24.7577 12.1359C24.7574 12.8019 24.2023 13.3418 23.5173 13.3418Z" fill="white"/>
                    <path d="M18 0C8.06039 0 0 7.83649 0 17.5C0 27.1635 8.06039 35 18 35C27.9396 35 36 27.1635 36 17.5C36 7.83649 27.9396 0 18 0ZM28.2736 21.643C28.2236 22.7127 28.0486 23.443 27.7932 24.0823C27.2563 25.4321 26.1587 26.4991 24.7703 27.0212C24.1131 27.2695 23.3616 27.4393 22.2616 27.4882C21.1594 27.5371 20.8073 27.5488 18.0003 27.5488C15.193 27.5488 14.8412 27.5371 13.7387 27.4882C12.6387 27.4393 11.8872 27.2695 11.2299 27.0212C10.54 26.7688 9.91544 26.3734 9.39908 25.862C8.87338 25.3603 8.46661 24.7528 8.20706 24.0823C7.95163 23.4433 7.77667 22.7127 7.72668 21.6432C7.67587 20.5714 7.66406 20.229 7.66406 17.5C7.66406 14.771 7.67587 14.4286 7.72641 13.357C7.7764 12.2873 7.95108 11.557 8.20651 10.9177C8.46606 10.2472 8.87311 9.63974 9.39908 9.13799C9.91516 8.62663 10.54 8.23116 11.2297 7.97882C11.8872 7.73048 12.6384 7.56065 13.7387 7.51179C14.8409 7.46292 15.193 7.45117 18 7.45117C20.807 7.45117 21.1591 7.46292 22.2613 7.51205C23.3616 7.56065 24.1128 7.73048 24.7703 7.97855C25.46 8.2309 26.0848 8.62663 26.6012 9.13799C27.1269 9.64001 27.5339 10.2472 27.7932 10.9177C28.0489 11.557 28.2236 12.2873 28.2739 13.357C28.3241 14.4286 28.3359 14.771 28.3359 17.5C28.3359 20.229 28.3241 20.5714 28.2736 21.643Z" fill="white"/>
                </svg> &nbsp;&nbsp;   
                </a>
                <a href="https://m.facebook.com/The-Elisabeth-Gauba-School-101013958058942/?tsid=0.2877527636126287&amp;source=result" target="_blank">
                    <svg width="20" height="20" viewBox="0 0 35 35" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M35 17.5C35 7.83399 27.166 0 17.5 0C7.83399 0 0 7.83399 0 17.5C0 27.166 7.83399 35 17.5 35C17.6025 35 17.7051 35 17.8076 34.9932V21.376H14.0479V16.9941H17.8076V13.7676C17.8076 10.0283 20.0908 7.99121 23.4268 7.99121C25.0264 7.99121 26.4004 8.10742 26.7969 8.16211V12.0723H24.5C22.6885 12.0723 22.333 12.9336 22.333 14.1982V16.9873H26.6738L26.1064 21.3691H22.333V34.3232C29.6475 32.2246 35 25.4912 35 17.5Z" fill="white"/>
                    </svg>
                </a>
			</div>
            <div class="col-md-4 agile_footer_grid">
                <ul>
					<li style="color:#ffffff"><i class="fa fa-map-marker" aria-hidden="true"></i>&nbsp;&nbsp;
                        <a style="color:#ffffff" href="https://goo.gl/maps/KMxgfUTnkhYQaNyR7" target="_blank">Gate No-9, Kali Bari Marg, New Delhi</a></li>
				</ul>
			</div>
			<div class="col-md-4 agile_footer_grid">
               <a style="color:#ffffff" href="mailto:shivniketan1@rediffmail.com">
                   <i class="fa fa-envelope"  aria-hidden="true"></i>&nbsp;&nbsp;shivniketan1@rediffmail.com</a>	
			</div>
			<div class="col-md-3 agile_footer_grid">
				<i class="fa fa-phone" style="color:#ffffff" aria-hidden="true">&nbsp;&nbsp;
                     <a style="color:#ffffff" href="tel:011-23367633" >011-23367633</a> &nbsp;/ &nbsp;
                     <a style="color:#ffffff" href="tel:011-23746659">011-23746659</a>
                </i>
			</div>
		</div>
        
	</div>
        </footer>
<script>
         
               $("#continue").click(function(){
 $("#block1").css("display" ,"none");
          $("#block2").css("display" ,"block");
    
  });
           
  $("#previous_page").click(function(){
    $("#block1").css("display" ,"block");
          $("#block2").css("display" ,"none");

    
  });

</script>
        <script type="application/x-javascript"> addEventListener("load", function() { setTimeout(hideURLbar, 0); }, false);
		function hideURLbar(){ window.scrollTo(0,1); } </script>
    

<script type="text/javascript">
//<![CDATA[
WebForm_AutoFocus('MainContent_ddlRegistrationforClass');//]]>
var today = new Date();
var dd = String(today.getDate()).padStart(2, '0');
var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
var yyyy = today.getFullYear();

today = dd + '-' + mm + '-' + yyyy;
$("#today_date").val(today);
</script>
</form>
</body>

</html>
