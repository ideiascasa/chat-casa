import {Fragment, useState} from 'react';
import moment from 'moment-timezone';
import 'moment/locale/pt-br';
import {PDFDocument} from 'pdf-lib';

export default function Documentos() {

    const [boletos, setResposta] = useState([]);
    const [datade, setDataDE] = useState(moment().format('YYYY-MM-DD'));
    const [dataate, setDataATE] = useState(moment().format('YYYY-MM-DD'));
    const [pdfuri, setPDFURI] = useState('');
    const [pdfErro, setPDFErro] = useState('');
    const [loading, setLoading] = useState(false);

    function carregar() {
        if (datade && dataate) {
            setLoading(true);
            setResposta([]);
            setPDFURI('');
            setPDFErro('');
            fetch(
                '/api/listaboletos',
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify({datade, dataate}),
                }).then(async response => {

                setResposta(await response.json());

            }).catch(async error => {

                setResposta([]);

            }).finally(() => {
                setLoading(false);
            });
        }
    }

    function handleDataDE(e) {
        setDataDE(e.target.value);
        setDataATE(e.target.value);
    }

    function handleDataATE(e) {
        setDataATE(e.target.value);
    }

    async function mergeAllPDFs() {

        try {
            setLoading(true);
            setPDFURI('');
            setPDFErro('');

            const pdfDoc = await PDFDocument.create();

            const allPromises = [];
            for (const conta of boletos) {
                if (conta.cCodigoBarras) {
                    let url = '/api/urlboleto/' + conta.nCodTitulo;
                    // const donorPdfBytes = (await fetch(
                    // 	url)).arrayBuffer()

                    allPromises.push(
                        fetch(url)
                        .then(res => res.arrayBuffer())
                    );
                }
            }
            await Promise.all(allPromises);

            let boletosErros = [];
            for (const conta of boletos) {
                if (conta.cCodigoBarras) {
                    try {

                        let url = '/api/urlboleto/' + conta.nCodTitulo;
                        // const donorPdfBytes = (await fetch(
                        // 	url)).arrayBuffer()

                        let donorPdfBytes = await fetch(url)
                            .then(res => res.arrayBuffer());

                        let donorPdfDoc = await PDFDocument.load(donorPdfBytes);
                        let docLength = donorPdfDoc.getPageCount();
                        for (let k = 0; k < docLength; k = k + 1) {
                            let [donorPage] = await pdfDoc.copyPages(donorPdfDoc, [k]);
                            pdfDoc.addPage(donorPage);
                        }
                    } catch (e) {
                        boletosErros.push(conta.nCodTitulo);
                    }
                }
            }
            if (boletosErros.length > 0) {
                setPDFErro('Erro ao gerar os boletos: ' + boletosErros.join(', '));
            }

            const pdfDataUri = await pdfDoc.saveAsBase64({dataUri: true});

            // strip off the first part to the first comma "data:image/png;base64,iVBORw0K..."
            setPDFURI('data:application/pdf;base64,' + pdfDataUri.substring(pdfDataUri.indexOf(',') + 1));

        } finally {
            setLoading(false);
        }
    }

    return (
        <Fragment>
            <div>
                <label>
                    Data Emissao Inicial:
                    <input type='date' value={datade} onChange={handleDataDE}/>
                </label>

                <label>
                    Data Emissao Final:
                    <input type='date' value={dataate} onChange={handleDataATE}/>
                </label>

                <label>
                    <button disabled={loading}
                            onClick={() => carregar()}>{loading ? 'Carregando...' : 'Pesquisar'}</button>
                </label>

                {(pdfuri || boletos.length === 0) ? '' :
                    <label>
                        <button disabled={loading}
                                onClick={() => mergeAllPDFs()}>{(loading) ? 'Carregando...' : 'Lote PDF'}</button>
                    </label>
                }

                {!pdfuri ? '' :
                    <label>
                        <a download="Lote.pdf" href={pdfuri}>Download</a>
                    </label>
                }
            </div>
            <div className='mx-auto p-2'/>

            {pdfErro? '':
            <Fragment>
                <pre>{pdfErro}</pre>
                <div className='mx-auto p-2'/>
            </Fragment>
            }

            <table className='table'>
                <thead>
                <tr>
                    <th scope='col'> CNPJ/CPF</th>
                    <th scope='col'> Numero Pedido</th>
                    <th scope='col'> Numero da Parcela</th>
                    <th scope='col'> Valor</th>
                    <th scope='col'> Codigo de barras</th>
                </tr>
                </thead>
                <tbody>

                {
                    (!boletos) ? '' :
                        <Fragment>
                            {
                                boletos.map((item, index) => {
                                    return (
                                        <tr key={index}>
                                            <td>{item.cCPFCNPJCliente}</td>
                                            <td>{item.cNumTitulo}</td>
                                            <td>
                                                {item.cCodigoBarras ?
                                                    <a href={'/api/urlboleto/' + item.nCodTitulo}
                                                       target='_blank'
                                                       rel='noreferrer'>{item.cNumParcela}</a>
                                                    : 'N/A'}
                                            </td>
                                            <td>{item.nValorTitulo}</td>
                                            <td>{item.cCodigoBarras}</td>
                                        </tr>
                                    );
                                })
                            }
                        </Fragment>
                }

                </tbody>
            </table>

        </Fragment>
    );

}
