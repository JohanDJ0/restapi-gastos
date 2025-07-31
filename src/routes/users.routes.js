import { Router } from "express";
import {getUsers,createUser,updateUser,deleteUsers,getUser} from '../controllers/users.controller.js'
const router = Router()


router.get('/users', getUsers)

router.get('/users/:id', getUser)

router.post('/users', createUser)

router.put('/users/:id', updateUser)

router.delete('/users/:id',deleteUsers )

export default router
