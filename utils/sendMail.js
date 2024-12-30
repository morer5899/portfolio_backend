import nodemailer from "nodemailer";

const sendMail=async(req,res)=>{
  try {
    const {name,email,message}=req.body;
    if(!name || !email || !message){
      return res.status(400).json({message:"please enter all information"});
    }
    const transport=nodemailer.createTransport({
      service:"GMAIL",
      auth:{
        user:process.env.EMAIL,
        pass:process.env.EMAIL_PASSWORD
      }
    })
    const mailOptions={
      from:process.env.EMAIL,
      to:process.env.RECEIVER_EMAIL,
      subject:`work`,
      html:`<div>
      <h1>${name}</h1>
      <h2>${email}</h2>
      <p>${message}</p>
      </div>`
    }
    const isError=false;
    transport.sendMail(mailOptions,(error,res)=>{
      if(error){
        console.log("error");
        isError=true;
      }else{
       console.log("email sended");
      }
    });

    if(isError){
      return res.status(400).json({message:"check your network connection",success:false});
    }else{
      return res.status(200).json({message:"mail sent successtully",success:true});
    }
  } catch (error) {
    console.log("nodemailer error =====>",error)
  }
}

export default sendMail;