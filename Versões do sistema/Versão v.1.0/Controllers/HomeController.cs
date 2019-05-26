using Newtonsoft.Json.Linq;
using ProjetoVersionador.Models;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace ProjetoVersionador.Controllers
{
    public class HomeController : Controller
    {
        public ActionResult Index()
        {
            return View();
        }
        [HttpPost]
        public ActionResult Principal(string user)
        {
            using (var bd = new SistemaBackupEntities())
            {

                //if (user == "perm")
                //    return View();

                JObject jDados = JObject.Parse(user);
                string login = jDados["login"].ToString();
                string senha = jDados["senha"].ToString();

                //AddArquivo();

                var objUsuario = bd.tbUsuarios.Where(obj => obj.Login == login).FirstOrDefault();

                if (objUsuario != null)
                {
                    if (objUsuario.Senha == senha)
                    {
                        //return Json(new { sucesso = true, nome = objUsuario.Nome, id = objUsuario.IdUsuario });
                        ViewBag.idUsuario = objUsuario.IdUsuario;
                        return View();
                    }
                    else
                    {
                        //return Json(new { sucesso = false, erro = "Senha incorreta" });
                        return null;
                    }
                }
                else
                {
                    return null;
                    //return Json(new { sucesso = false, erro = "Usuário não encontrado" });
                }

            }

        }

        [HttpGet]
        public JsonResult GetArquivos()
        {
            try
            {
                using (var bd = new SistemaBackupEntities())
                {
                    var lista = bd.tbArquivosAtuais.ToArray().Select(obj => new
                    {
                        id = obj.IdArquivo,
                        nomearquivo = obj.NomeArquivo.Split('.')[0],
                        extensao = obj.ExtensaoArquivo,
                        dataupload = obj.DataUpload.ToString(),
                        idusuario = obj.IdUsuario,
                        nomeusuario = obj.tbUsuarios.Nome,
                        descricao = obj.Descricao,
                        status = obj.Status,
                        projeto = obj.Projeto,
                        usuarioDownload = obj.tbUsuarios1 != null ? obj.tbUsuarios1.Nome : "",
                        idUsuarioDownload = obj.IdUsuarioDownload
                    }).ToArray();



                    return Json(lista, JsonRequestBehavior.AllowGet);
                }
            }
            catch (Exception ex)
            {

                throw ex;
            }

        }

        public string convertData(DateTime data)
        {
            return data.ToShortDateString();
        }


        [HttpPost]
        public JsonResult DevolverArquivo(int idArquivo, int idUsuarioDownload)
        {
            try
            {
                using(var bd = new SistemaBackupEntities())
                {
                    if (idArquivo == null)
                        throw new Exception("Id do arquivo inválido!");

                    var arquivo = bd.tbArquivosAtuais.Where(obj => obj.IdArquivo == idArquivo).FirstOrDefault();

                    if (arquivo != null)
                    {
                        arquivo.IdUsuarioDownload = null;
                        arquivo.Status = 1;
                        arquivo.DataUpload = DateTime.Now;
                        bd.SaveChanges();

                        return Json("");
                    }
                    else
                        throw new Exception("Arquivo inexistente!");

                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpGet]
        public FileResult DownloadArquivo(int id, int idUsuario)
        {
            try
             {
                using(var bd = new SistemaBackupEntities())
                {
                    if (id == null)
                        throw new Exception("Id do arquivo inválido!");

                    var arquivo = bd.tbArquivosAtuais.Where(obj => obj.IdArquivo == id).FirstOrDefault();

                    if (arquivo != null)
                    {
                        arquivo.IdUsuarioDownload = idUsuario;
                        arquivo.Status = 2;
                        bd.SaveChanges();

                        return File(arquivo.Arquivo, arquivo.ExtensaoArquivo.Replace(".", ""), arquivo.NomeArquivo + arquivo.ExtensaoArquivo);
                    }
                    else
                        throw new Exception("Arquivo inexistente!");


                }
            }
            catch (Exception ex)
            {
                throw ex;
            }
        }

        [HttpPost]
        public JsonResult AddArquivo(HttpPostedFileBase file, string descricao, string nomeProjeto, int idUsuario, int? idArquivo = -1)
        {

            try
            {

                using (var bd = new SistemaBackupEntities())
                {

                    byte[] bin;
                    string mimeType;

                    if (file != null)
                    {
                        if (file.FileName.LastIndexOf('.') == -1)
                            throw new Exception("Arquivos sem exteñsão não são permitidos.");

                        mimeType = MimeMapping.GetMimeMapping(file.FileName);

                        Stream stream = file.InputStream;
                        BinaryReader binaryReader = new BinaryReader(stream);
                        bin = binaryReader.ReadBytes((Int32)stream.Length);

                        tbArquivosAtuais novoArquivo = new tbArquivosAtuais();

                        novoArquivo.IdUsuario = idUsuario;
                        novoArquivo.Projeto = nomeProjeto;
                        novoArquivo.NomeArquivo = file.FileName;
                        novoArquivo.ExtensaoArquivo = "." + file.FileName.Split('.')[1];
                        novoArquivo.DataUpload = DateTime.Now;
                        novoArquivo.Descricao = descricao;
                        novoArquivo.Status = 1;
                        novoArquivo.Arquivo = bin;

                        bd.tbArquivosAtuais.Add(novoArquivo);
                        bd.SaveChanges();

                    }

                    return Json(new { codigo = 1 }, JsonRequestBehavior.AllowGet);



                    //byte[] photo = GetPhoto("C:\\Trabalho\\teste3.txt");

                    //tbArquivosAtuais novoArquivo = new tbArquivosAtuais();

                    //novoArquivo.IdUsuario = 1;
                    //novoArquivo.Projeto = "Projeto Teste 3";
                    //novoArquivo.NomeArquivo = "teste";
                    //novoArquivo.ExtensaoArquivo = "txt";
                    //novoArquivo.DataUpload = DateTime.Now;
                    //novoArquivo.Descricao = "Arquivo gerado para teste 2";
                    //novoArquivo.Status = 1;
                    //novoArquivo.Arquivo = photo;

                    //bd.tbArquivosAtuais.Add(novoArquivo);
                    //bd.SaveChanges();
                }
            }
            catch (Exception ex)
            {
                return Json(new { codigo = 0, Erro = ex.Message.ToString() }, JsonRequestBehavior.AllowGet);
            }
        }


        public byte[] GetPhoto(string filePath)
        {
            FileStream stream = new FileStream(
                filePath, FileMode.Open, FileAccess.Read);
            BinaryReader reader = new BinaryReader(stream);

            byte[] photo = reader.ReadBytes((int)stream.Length);

            reader.Close();
            stream.Close();

            return photo;
        }

        [HttpPost]
        public JsonResult Cadastro(string user)
        {
            try
            {
                using (var bd = new SistemaBackupEntities())
                {
                    JObject jDados = JObject.Parse(user);
                    string login = jDados["login"].ToString();
                    string senha = jDados["senha"].ToString();
                    string nome = jDados["nome"].ToString();

                    var objUsuario = bd.tbUsuarios.Where(obj => obj.Login == login).FirstOrDefault();

                    if (objUsuario == null)
                    {
                        objUsuario = new tbUsuarios();
                        objUsuario.Nome = nome;
                        objUsuario.Login = login;
                        objUsuario.Senha = senha;
                        bd.tbUsuarios.Add(objUsuario);
                        bd.SaveChanges();

                        return Json(new { status = 1 });

                    }
                    else
                    {
                        return Json(new { status = 2 });
                    }
                }
            }
            catch (Exception ex)
            {
                return Json(new { erro = ex.Message });
            }
        }


    }

}