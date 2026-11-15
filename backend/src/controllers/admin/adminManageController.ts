import { Request, Response } from "express";
import { injectable, inject } from "tsyringe";
import { Server } from "socket.io";
import { IAdminManageController } from "./interface/IAdminManageController";
import AdminManageService from "../../services/admin/adminMangeService";


@injectable()
class AdminMangeControllers implements IAdminManageController {


  constructor(
    @inject("AdminManageService")
    private adminManageService: AdminManageService
  ) {}




  getUsers = async (
    _req: Request,
    res: Response
  ): Promise<void> => {

    try {


      const users =
      await this.adminManageService.getAllUsers();


      console.log(
        users,
        "controller"
      );


      res.status(200).json(users);



    } catch(error){


      console.error(error);


      res.status(500).json({

        message:"Internal server error"

      });


    }

  };








  blockUser = async (
    req:Request,
    res:Response
  ):Promise<void> => {


    try {


      const userId =
      String(req.params.userId);



      if(!userId){


        res.status(400).json({

          message:"User ID is required"

        });


        return;

      }




      await this.adminManageService.blockUser(
        userId
      );

      const io = req.app.get("io") as Server | undefined;
      if (io) {
        io.in(userId).disconnectSockets(true);
      }

      res.status(200).json({

        message:"User blocked successfully"

      });



    }catch(error){


      console.error(
        "Controller Error - blockUser:",
        error
      );



      res.status(500).json({

        message:"Internal Server Error"

      });


    }

  }









  unblockUser = async (
    req:Request,
    res:Response
  ):Promise<void> => {


    try {


      const userId =
      String(req.params.userId);



      console.log(
        userId,
        "oooo"
      );



      if(!userId){


        res.status(400).json({

          message:"User ID is required"

        });


        return;

      }




      await this.adminManageService.unBlockUser(
        userId
      );



      res.status(200).json({

        message:"User unblocked successfully"

      });



    }catch(error){


      console.error(
        "Controller Error - unblockUser:",
        error
      );



      res.status(500).json({

        message:"Internal Server Error"

      });


    }

  }









  getAllEvents = async (
    _req:Request,
    res:Response
  ):Promise<void> => {


    try {


      const events =
      await this.adminManageService.getAllEvents();



      res.status(200).json({

        data:events

      });



    }catch(error){


      console.error(
        "Error in getAllEvents controller:",
        error
      );



      res.status(500).json({

        message:"Internal server error"

      });


    }

  }









  approveEvent = async (
    req:Request,
    res:Response
  ):Promise<void> => {


    try {


      const eventId =
      String(req.params.eventId);



      if(!eventId){


        res.status(400).json({

          message:"eventId is required"

        });


        return;

      }





      await this.adminManageService.approveEvent(
        eventId
      );



      res.status(200).json({

        message:"approved successfully"

      });



    }catch(error){


      console.error(
        "Controller Error - approveEvent:",
        error
      );



      res.status(500).json({

        message:"Internal Server Error"

      });


    }

  }









  unapproveEvent = async (
    req:Request,
    res:Response
  ):Promise<void> => {


    try {


      const eventId =
      String(req.params.eventId);



      console.log(
        eventId,
        "controller anutta"
      );



      if(!eventId){


        res.status(400).json({

          message:"eventId is required"

        });


        return;

      }




      await this.adminManageService.unapproveEvent(
        eventId
      );



      res.status(200).json({

        message:"Unapproved successfully"

      });



    }catch(error){


      console.error(
        "Controller Error - unapproveEvent:",
        error
      );



      res.status(500).json({

        message:"Internal Server Error"

      });


    }

  }


}


export default AdminMangeControllers;