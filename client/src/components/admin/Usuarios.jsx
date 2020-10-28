// ========================= IMPORTS =================================================
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Usuarios.css';
import axios from 'axios';
import {dateFormat} from '../../utils/utils.js' 

// ========================= COMPONENT ===============================================

export default function Usuarios({getUsers, rol}) {

    const [users, setUsers] = useState([])
    const [role, setRole] = useState(false)
    const [usersFiltered, setUsersFiltered] = useState(users)
    
    // =======================================================
    //      PAGINACIÓN
    // =======================================================
    
    const [pageActual, setPageActual] = useState(1);
    const [prodsPorPage, setProdsPorPage] = useState(10); 

    const pageNumbers = []
    for (let i = 1; i <= Math.ceil(usersFiltered.length / prodsPorPage); i++) {
        pageNumbers.push(i);
    }

    const indexOfLastPost = pageActual * prodsPorPage;
    const indexOfFirstPost = indexOfLastPost - prodsPorPage;
    const currentPosts = usersFiltered.slice(indexOfFirstPost, indexOfLastPost);

    // =======================================================

    const handlePromotion = (e,id) => {
        axios.post(`http://localhost:3001/auth/promote/${id}`, {withCredentials: true})
        .then(data => { 
            console.log(data)
            return setRole(!role)
            })
        .catch(error =>{
            new Error(error)
    })
    }

    const handleDemotion = (e,id) => {
        axios.post(`http://localhost:3001/auth/demote/${id}`, {withCredentials: true})
        .then(data => { 
            console.log(data)
            return setRole(!role)
            })
        .catch(error =>{
            new Error(error)
    })
    }

    const handleDelete = async (e,id) => {
        const rta = await axios.put(`http://localhost:3001/user/${id}`, {status: "Inactivo"} ,{withCredentials: true})
        if (rta.status === 200) return setRole(!role);
        if (rta.status !== 200) return window.alert('Hubo un error... Intentar más tarde.')
            return
    }
    const handleSwitch = (e) => {
        const {value} = e.target
        setUsersFiltered(users.filter(user => user.status == value))
    } 

    
    useEffect(()=>{

    getUsers().then(a=> {setUsers(a)})

    //     Condiciono para que cuando monte el componente renderize correctamente y pagine bien 
    if (!usersFiltered.length)  setUsersFiltered(users.filter(user => user.status == "Activo"))
    },[role, usersFiltered])
    
    return (
        <div className="col-md-10 panel-right row" style={{ paddingTop: '25px' }}>
            <div className="col-md-13 col-lg-13">
                <h2 className="titleUsers">Todos los Usuarios</h2>
                <p/>
                <div className='ContainerStatus' >
                    <p className='FilterTitle'>Filtrar por status</p>
                    <select className='Select' onChange={(e)=>handleSwitch(e)} name="select">
                        {/* <option value="Todos">Todos</option> */}
                        <option value="Activo" selected>Activo</option> 
                        <option value="Inactivo">Inactivo</option>
                    </select>
                </div>
                <table className="table table-hover table-dark">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Name</th>
                            <th scope="col">Lastname</th>
                            <th scope="col">Email</th>
                            <th scope="col">Address</th>
                            <th scope="col">Phone</th>
                            <th scope="col">Birthdate</th>
                            <th scope="col">Role</th>
                            <th scope="col">Creation date</th>
                            {rol === 'Admin' && <th scope="col">Role</th>}
                            {rol === 'Admin' && <th scope="col">Desactivar</th>}
                        </tr>
                    </thead>
                    <tbody>
                        { 
                            currentPosts.length > 0 && currentPosts.map(dato => {
                                // if (dato.status === "Activo"){
                                return ( 
                                    <tr key={dato.id} >
                                    <td><Link to={`/profile/${dato.id}`}>{dato.id}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dato.name}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dato.lastname}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dato.email}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dato.address}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dato.phone}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dateFormat(dato.birthdate)}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dato.role}</Link></td>
                                    <td><Link to={`/profile/${dato.id}`}>{dateFormat(dato.creationdate)}</Link></td>
                                    {rol === 'Admin' && <td>{dato.role === 'Cliente' && <button className="adam-button adam-chng" onClick={e => (window.confirm('Estas segur@ de querer cambiar el rol del usuario a: "Responsable"?') && handlePromotion(e, dato.id))}>Promote</button>} 
                                    {dato.role === 'Responsable' && <button className="adam-button adam-chng" onClick={e => (window.confirm('Estas segur@ de querer cambiar el rol del usuario a: "Cliente"?') && handleDemotion(e, dato.id))}>Demote</button>}</td>}
                                    {(rol === 'Admin' && dato.role !== 'Admin') && <td><button className="adam-button adam-chng" onClick={e => (window.confirm('Segur@ que quieres desactivar este usuario?') && handleDelete(e, dato.id))}>X</button></td>}
                                </tr>
                                )
                            // } else {return}
                            
                            })
                        }
                    </tbody>
                </table>
                 {/* BOTONES DE PAGINACION */}
                <nav>
                    <ul className="pagination d-flex justify-content-center">
                        {pageNumbers.map((numero, i) => (
                        <li key={i} className="page-item">
                         <a onClick={(e) => {e.preventDefault(); setPageActual(numero)}} href="#" className="page-link">{numero}</a>
                        </li>
                    ))}
                    </ul>
                </nav>
            </div>
        </div>
    )
}





