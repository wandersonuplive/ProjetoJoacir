//------------------------------------------------------------------------------
// <auto-generated>
//     This code was generated from a template.
//
//     Manual changes to this file may cause unexpected behavior in your application.
//     Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace ProjetoVersionador.Models
{
    using System;
    using System.Collections.Generic;
    
    public partial class tbArquivosAtuais
    {
        public int IdArquivo { get; set; }
        public string Projeto { get; set; }
        public string NomeArquivo { get; set; }
        public string ExtensaoArquivo { get; set; }
        public System.DateTime DataUpload { get; set; }
        public int IdUsuario { get; set; }
        public string Descricao { get; set; }
        public int Status { get; set; }
        public byte[] Arquivo { get; set; }
        public Nullable<int> IdUsuarioDownload { get; set; }
    
        public virtual tbUsuarios tbUsuarios { get; set; }
        public virtual tbUsuarios tbUsuarios1 { get; set; }
    }
}
