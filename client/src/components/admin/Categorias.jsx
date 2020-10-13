import React, { useState, useEffect } from 'react';
import './Categorias.css';

export default function Categorias({ categorias, deleteCategory, getCategory, category, addCategory, modCategory }) {

    const [addCat, setAddCat] = useState({
        name: '',
        description: '',
        status: 'Activado'
    });

    const [modCat, setModCat] = useState({
        id: 0,
        name: '',
        description: '',
        status: ''
    });

    const [textButton, setTextButton] = useState('Agregar')

    useEffect(() => {
        setAddCat({ ...addCat, id: categorias.length > 0 && categorias[categorias.length - 1].id + 1 });
        setModCat(category);
    }, [categorias, category, textButton])

    //Agrega al estado los datos que se van ingresando
    function handleChange(e) {
        e.preventDefault();
        if (textButton === 'Agregar') {
            setAddCat({
                ...addCat,
                [e.target.id]: e.target.value
            });
        } else {
            setModCat({
                ...modCat,
                [e.target.id]: e.target.value
            });
        }
    }

    const onClick = (e) => {
        if (textButton === 'Agregar') {
            setAddCat({ ...addCat, status: e.target.value });
        } else {
            setModCat({ ...modCat, status: e.target.value });
        }
    }

    return (
        <div className="col-md-10 panel-right row" style={{ paddingTop: '25px' }}>
            <div className="col-md-7 col-lg-8">
                <h2>Todas las Categorias</h2>
                <p>Elija la categoria a modificar</p>
                <table className="table table-hover table-dark">
                    <thead>
                        <tr>
                            <th scope="col">Id</th>
                            <th scope="col">Nombre</th>
                            <th scope="col">Descripcion</th>
                            <th scope="col">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            categorias.length > 0 && categorias.map(dato => {
                                return (<tr key={dato.id} >
                                    <th scope="row">{dato.id}</th>
                                    <td style={{ textAlign: 'left' }}>{dato.name}</td>
                                    <td style={{ textAlign: 'left' }}>{dato.description}</td>
                                    <td>{dato.price}</td>
                                    <td>{dato.stock}</td>
                                    <td>
                                        <a className="iconTable"><i className="far fa-edit" id={dato.id} style={{ marginRight: '10px' }} onClick={(e) => {
                                            e.preventDefault();
                                            getCategory(dato.id)
                                            setTextButton('Modificar');
                                            setModCat(category);
                                        }}></i></a>
                                        <a className="iconTable"><i className="far fa-trash-alt" id={dato.id} onClick={(e) => {
                                            e.preventDefault();
                                            if (!window.confirm('Esta por eliminar una categoria, desea continuar?')) {
                                                return false;
                                            }
                                            deleteCategory(dato.id);
                                        }}></i></a>
                                    </td>
                                </tr>)
                            })
                        }
                    </tbody>
                </table>
            </div>
            <div className="col-md-5 col-lg-4">
                    <h2>{textButton === 'Agregar' ? 'Agregar Categoría' : 'Modificar Categoría'}</h2>
                <p>Rellene todos los campos</p>
                <form className="text-center border border-light p-5 form-category">
                    <input type="text" id="name" className="form-control mb-4" placeholder="Titulo" onChange={handleChange} value={textButton == 'Agregar' ? addCat.name : modCat.name} />
                    <input type="description" id="description" className="form-control mb-4" placeholder="Descripcion" onChange={handleChange} value={textButton == 'Agregar' ? addCat.description : modCat.description} />
                    <div className="radio activ">
                        <label><input type="radio" name="optradio" value="Activado" onClick={(e) => onClick(e)} />Activado</label>
                    </div>
                    <div className="radio desactiv">
                        <label><input type="radio" name="optradio" value="Desactivado" onClick={(e) => onClick(e)} />Desactivado</label>
                    </div>
                    <button className="btn btn-info btn-block my-4 buttonAddMod" onClick={(e) => {
                        // e.preventDefault();
                        if (textButton === 'Agregar') addCategory(addCat);
                        if (textButton === 'Modificar') modCategory(modCat);
                    }}>{textButton}</button>
                </form>
            </div>
        </div>
    )
}