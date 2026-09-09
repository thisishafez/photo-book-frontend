import {
  useState,
  useEffect
} from "react";

import {
  useNavigate
} from "react-router-dom";

import {
  useTheme
} from "../../../contexts/ThemeContext";

import {
  useAuth
} from "../../../contexts/AuthContext";

import {
  api
} from "../../../services/api";

import "./ProfileSetup.css";


export default function ProfileSetup() {


  const navigate = useNavigate();


  const {
    darkMode
  } = useTheme();



  const {
    user
  } = useAuth();



  const [
    displayName,
    setDisplayName
  ] = useState("");



  const [
    handle,
    setHandle
  ] = useState("");



  const [
    businessName,
    setBusinessName
  ] = useState("");



  const [
    locationInfo,
    setLocationInfo
  ] = useState("");



  const [
    catalog,
    setCatalog
  ] = useState([]);



  const [
    selected,
    setSelected
  ] = useState([]);



  const [
    isLoading,
    setIsLoading
  ] = useState(false);



  const [
    error,
    setError
  ] = useState("");





  useEffect(() => {


    if(user?.accountType === "user"){

      api.user
        .getInterestCatalog()

        .then(setCatalog)

        .catch(() => {

          setError(
            "Couldn't load interests. You can add them later."
          );

        });

    }


  }, [user]);







  const toggleInterest = (id) => {


    setSelected(prev =>


      prev.includes(id)

        ? prev.filter(
            item => item !== id
          )

        :

          [
            ...prev,
            id
          ]

    );


  };








  const handleContinue = async () => {


    setIsLoading(true);

    setError("");



    try {


      /*
        Regular User
      */

      if(
        user.accountType === "user"
      ){


        await api.user.createProfile(

          displayName.trim(),

          handle.trim(),

          null

        );



        if(selected.length > 0){


          await api.user.setInterests(
            selected
          );


        }


      }





      /*
        Host
      */

      else if(
        user.accountType === "host"
      ){


        await api.host.createProfile(

          businessName.trim(),

          locationInfo.trim() || null

        );


      }





      /*
        Moderator
      */

      else if(
        user.accountType === "moderator"
      ){


        await api.moderator.createProfile();


      }






      localStorage.setItem(

        `profileCompleted:${user.id}`,

        "true"

      );



      navigate("/");



    }

    catch(err){


      setError(

        err.message ||

        "Couldn't save your profile. Please try again."

      );


    }

    finally{


      setIsLoading(false);


    }


  };









  const canContinue =


    (

      user?.accountType === "moderator"


      ||

      (

        user?.accountType === "host"

        &&

        businessName.trim()

      )


      ||

      (

        user?.accountType === "user"

        &&

        displayName.trim()

        &&

        handle.trim()

      )


    )


    &&

    !isLoading;









  return (


    <div

      className={

        `profile-setup-page ${

          darkMode

          ?

          "dark"

          :

          ""

        }`

      }

    >




      <div className="profile-setup-card">





        <h1>
          Welcome to Khātere
        </h1>




        <p>

          Tell us a bit about yourself,
          then pick your interests.

        </p>







        {
          error && (


            <div className="api-error">

              {error}

            </div>


          )
        }








        {
          user?.accountType === "user"

          &&

          (

          <>


            <div className="form-group">


              <input


                type="text"


                placeholder="Display name"


                value={displayName}


                onChange={(e)=>

                  setDisplayName(
                    e.target.value
                  )

                }


                disabled={isLoading}


              />


            </div>








            <div className="form-group">


              <input


                type="text"


                placeholder="Handle (e.g. yasin)"


                value={handle}


                onChange={(e)=>

                  setHandle(
                    e.target.value.toLowerCase()
                  )

                }


                disabled={isLoading}


              />


            </div>









            <div className="interest-grid">


              {

                catalog.map(

                  interest => (


                    <button


                      key={interest.ID}


                      className={

                        selected.includes(
                          interest.ID
                        )

                        ?

                        "interest selected"

                        :

                        "interest"

                      }



                      onClick={()=>

                        toggleInterest(
                          interest.ID
                        )

                      }



                      disabled={isLoading}



                      type="button"


                    >


                      {
                        interest.Label
                      }


                    </button>


                  )


                )

              }


            </div>



          </>

          )

        }









        {
          user?.accountType === "host"

          &&

          (


          <>


            <div className="form-group">


              <input


                type="text"


                placeholder="Business name"


                value={businessName}


                onChange={(e)=>

                  setBusinessName(
                    e.target.value
                  )

                }


                disabled={isLoading}


              />


            </div>







            <div className="form-group">


              <input


                type="text"


                placeholder="Location information"


                value={locationInfo}


                onChange={(e)=>

                  setLocationInfo(
                    e.target.value
                  )

                }


                disabled={isLoading}


              />


            </div>



          </>


          )

        }









        {
          user?.accountType === "moderator"

          &&

          (


            <p>

              Your moderator account is ready.
              Click continue to finish setup.

            </p>


          )

        }









        <button


          className="continue-btn"


          disabled={!canContinue}



          onClick={handleContinue}



        >


          {

            isLoading

            ?

            "Saving..."

            :

            "Continue"

          }


        </button>






      </div>






    </div>


  );


}