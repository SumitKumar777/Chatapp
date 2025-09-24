type Time={
   time:string
}


function Time({time}:Time) {

   const hour=new Date(time).getHours();
   const min=new Date(time).getMinutes();

   const displayHour=hour===0 ? 12:( hour > 12 ? hour-12 :hour );
   const period= hour <12 ? "am":"pm";

   const formattedHour= displayHour < 10 ? `0${displayHour}`:displayHour;
   const formattedMin= min <10 ? `0${min}`:min;


   return ( 
      <p className="font-semibold">{formattedHour}:{formattedMin} {period}</p>
    );
}

export default Time;