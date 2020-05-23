# linqTS
npm install @mgmguardiana/linqts

<b>Import to your typescript file</b><br/>
<i>import {Linq} from '@mgmguardiana/linqts/linq';</i>

<b>Initialize instance and use array objects inside the instance using Linq.create</b><br/>
<br/>
export class SampleModel{<br/>
  constructor(public province:string,public city:string,public barangay:string){}<br/>
}<br/>
<br/>
export class main{<br/>
	var arrays=[<br/>
    new SampleModel("Batangas","Calaca","Cawong"),<br/>
    new SampleModel("Cavite","Dasmarinas","San Agustin"),<br/>
    new SampleModel("Batangas","Calaca","Dacanlao"),<br/>
    new SampleModel("Batangas","Balayan","Lanatan"),<br/>
    new SampleModel("Batangas","Balayan","Sampaga")<br/>
  ];<br/><br/>
  <b>var linq=Linq.create(arrays);</b>//Linq uses generic, it will detect the type that your array use<br/>
}<br/>
<br/>
<b>Sample functions</b><br/>
var orderedByProvinceArrays=linq.orderBy(x=>x.province)<br/>
                                .toArray();<br/>
var orderByThenArrays=linq.orderBy(x=>x.province)<br/>
                          .thenBy(x=>x.city)<br/>
                          .thenByDescending(x=>x.barangay)<br/>
                          .toArray();<br/>
  
 var batangasAreas=linq.where(x=>x.province=="Batangas")<br/>
                       .toArray();<br/>
}
