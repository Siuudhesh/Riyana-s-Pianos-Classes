import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";
import { db } from "../firebase/config";
import { collection, query, getDocs } from "firebase/firestore";

const NextClassContext = createContext();

export const useNextClass = () => useContext(NextClassContext);

export const NextClassProvider = ({ children }) => {
  const [nextClass, setNextClass] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch the classes when the component mounts
    const fetchNextClass = async () => {
      try {
        const classesRef = collection(db, "classes");
        const q = query(classesRef);
        const querySnapshot = await getDocs(q);
        const fetchedClasses = querySnapshot.docs.map((doc) => doc.data());
        const upcomingClass = fetchedClasses.find(classItem => 
          moment(classItem.date + ' ' + classItem.time).isAfter(moment())
        );

        setNextClass(upcomingClass);
      } catch (error) {
        console.error("Error fetching classes:", error);
      }
    };

    fetchNextClass();
  }, []);

  return (
    <NextClassContext.Provider value={{ nextClass }}>
      {children}
    </NextClassContext.Provider>
  );
};
